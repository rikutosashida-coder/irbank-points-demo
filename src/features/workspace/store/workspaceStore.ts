import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../services/storage/indexedDB';
import type {
  Workspace,
  SourceDocument,
  Fragment,
  Connection,
  FragmentGroup,
  CanvasViewport,
  InteractionMode,
  ToolMode,
  CreateWorkspaceDto,
  CreateFragmentDto,
  FragmentColor,
} from '../types/workspace.types';

// ============================================
// Store Interface
// ============================================

interface WorkspaceStore {
  // ── Persistent Data ──
  workspace: Workspace | null;
  sources: Record<string, SourceDocument>;
  fragments: Record<string, Fragment>;
  connections: Record<string, Connection>;
  groups: Record<string, FragmentGroup>;

  isLoading: boolean;

  // ── Ephemeral UI ──
  viewport: CanvasViewport;
  interaction: InteractionMode;
  toolMode: ToolMode;
  selectedFragmentIds: Set<string>;
  hoveredFragmentId: string | null;
  splitRatio: number;

  // ── Workspace CRUD ──
  loadWorkspace: (noteId: string) => Promise<void>;
  createWorkspace: (dto: CreateWorkspaceDto) => Promise<string>;
  saveViewport: () => Promise<void>;
  setSplitRatio: (ratio: number) => Promise<void>;

  // ── Source ──
  addSource: (source: Omit<SourceDocument, 'id' | 'workspaceId' | 'addedAt'>) => Promise<string>;
  setActiveSource: (sourceId: string) => void;

  // ── Fragment CRUD ──
  createFragment: (dto: CreateFragmentDto) => Promise<string>;
  moveFragment: (id: string, position: { x: number; y: number }) => void;
  resizeFragment: (id: string, size: { width: number; height: number }) => void;
  updateFragmentNote: (id: string, userNote: string) => void;
  updateFragmentColor: (id: string, color: FragmentColor) => void;
  removeFragment: (id: string) => Promise<void>;

  // ── Connection ──
  addConnection: (fromId: string, toId: string, label?: string) => Promise<string>;
  updateConnectionLabel: (id: string, label: string) => void;
  removeConnection: (id: string) => Promise<void>;

  // ── Group ──
  createGroup: (fragmentIds: string[], title?: string) => Promise<string>;
  dissolveGroup: (groupId: string) => void;
  updateGroupTitle: (groupId: string, title: string) => void;

  // ── UI Actions ──
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  setInteraction: (mode: InteractionMode) => void;
  setToolMode: (mode: ToolMode) => void;
  selectFragment: (id: string, append?: boolean) => void;
  clearSelection: () => void;
  setHoveredFragment: (id: string | null) => void;

  // ── Persist helpers ──
  _persistFragments: () => Promise<void>;
  _persistConnections: () => Promise<void>;
}

// ============================================
// Default values
// ============================================

const DEFAULT_VIEWPORT: CanvasViewport = { panX: 0, panY: 0, zoom: 1 };
const DEFAULT_FRAGMENT_WIDTH = 240;
const DEFAULT_FRAGMENT_HEIGHT = 120;

// ============================================
// Store
// ============================================

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspace: null,
  sources: {},
  fragments: {},
  connections: {},
  groups: {},
  isLoading: false,

  viewport: { ...DEFAULT_VIEWPORT },
  interaction: { type: 'idle' },
  toolMode: 'select',
  selectedFragmentIds: new Set(),
  hoveredFragmentId: null,
  splitRatio: 0.4,

  // =====================
  // Workspace
  // =====================

  loadWorkspace: async (noteId: string) => {
    set({ isLoading: true });
    try {
      const allWorkspaces = await db.workspaces.where('noteId').equals(noteId).toArray();
      const ws = allWorkspaces[0] as Workspace | undefined;

      if (!ws) {
        set({ workspace: null, sources: {}, fragments: {}, connections: {}, groups: {}, isLoading: false });
        return;
      }

      const [srcArr, fragArr, connArr, grpArr] = await Promise.all([
        db.sourceDocuments.where('workspaceId').equals(ws.id).toArray(),
        db.fragments.where('workspaceId').equals(ws.id).toArray(),
        db.connections.where('workspaceId').equals(ws.id).toArray(),
        db.fragmentGroups.where('workspaceId').equals(ws.id).toArray(),
      ]);

      const toRecord = <T extends { id: string }>(arr: T[]) =>
        arr.reduce((acc, item) => { acc[item.id] = item; return acc; }, {} as Record<string, T>);

      set({
        workspace: ws,
        sources: toRecord(srcArr as SourceDocument[]),
        fragments: toRecord(fragArr as Fragment[]),
        connections: toRecord(connArr as Connection[]),
        groups: toRecord(grpArr as FragmentGroup[]),
        viewport: ws.savedViewport || { ...DEFAULT_VIEWPORT },
        splitRatio: ws.splitRatio || 0.4,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  createWorkspace: async (dto: CreateWorkspaceDto) => {
    const ws: Workspace = {
      id: uuidv4(),
      noteId: dto.noteId,
      title: dto.title,
      splitRatio: 0.4,
      activeSourceId: null,
      savedViewport: { ...DEFAULT_VIEWPORT },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.workspaces.add(ws);
    set({
      workspace: ws,
      sources: {},
      fragments: {},
      connections: {},
      groups: {},
      viewport: { ...DEFAULT_VIEWPORT },
      splitRatio: 0.4,
    });
    return ws.id;
  },

  saveViewport: async () => {
    const { workspace, viewport } = get();
    if (!workspace) return;
    await db.workspaces.update(workspace.id, { savedViewport: viewport, updatedAt: new Date() } as any);
  },

  setSplitRatio: async (ratio: number) => {
    const clamped = Math.max(0.2, Math.min(0.8, ratio));
    set({ splitRatio: clamped });
    const { workspace } = get();
    if (workspace) {
      await db.workspaces.update(workspace.id, { splitRatio: clamped, updatedAt: new Date() } as any);
    }
  },

  // =====================
  // Source
  // =====================

  addSource: async (data) => {
    const { workspace } = get();
    if (!workspace) throw new Error('No workspace');
    const src: SourceDocument = {
      ...data,
      id: uuidv4(),
      workspaceId: workspace.id,
      addedAt: new Date(),
    };
    await db.sourceDocuments.add(src);
    set(s => ({
      sources: { ...s.sources, [src.id]: src },
      workspace: s.workspace ? { ...s.workspace, activeSourceId: src.id } : null,
    }));
    if (workspace) {
      await db.workspaces.update(workspace.id, { activeSourceId: src.id, updatedAt: new Date() } as any);
    }
    return src.id;
  },

  setActiveSource: (sourceId: string) => {
    set(s => ({
      workspace: s.workspace ? { ...s.workspace, activeSourceId: sourceId } : null,
    }));
  },

  // =====================
  // Fragment
  // =====================

  createFragment: async (dto: CreateFragmentDto) => {
    const { workspace } = get();
    if (!workspace) throw new Error('No workspace');
    const frag: Fragment = {
      id: uuidv4(),
      workspaceId: workspace.id,
      sourceRef: dto.sourceRef,
      excerptText: dto.excerptText,
      position: dto.position,
      size: { width: DEFAULT_FRAGMENT_WIDTH, height: DEFAULT_FRAGMENT_HEIGHT },
      userNote: '',
      color: dto.color || 'gray',
      groupId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.fragments.add(frag);
    set(s => ({ fragments: { ...s.fragments, [frag.id]: frag } }));
    return frag.id;
  },

  moveFragment: (id, position) => {
    set(s => ({
      fragments: {
        ...s.fragments,
        [id]: s.fragments[id] ? { ...s.fragments[id], position, updatedAt: new Date() } : s.fragments[id],
      },
    }));
    // debounced persist は呼び出し元で行う
  },

  resizeFragment: (id, size) => {
    set(s => ({
      fragments: {
        ...s.fragments,
        [id]: s.fragments[id] ? { ...s.fragments[id], size, updatedAt: new Date() } : s.fragments[id],
      },
    }));
  },

  updateFragmentNote: (id, userNote) => {
    set(s => ({
      fragments: {
        ...s.fragments,
        [id]: s.fragments[id] ? { ...s.fragments[id], userNote, updatedAt: new Date() } : s.fragments[id],
      },
    }));
  },

  updateFragmentColor: (id, color) => {
    set(s => ({
      fragments: {
        ...s.fragments,
        [id]: s.fragments[id] ? { ...s.fragments[id], color, updatedAt: new Date() } : s.fragments[id],
      },
    }));
  },

  removeFragment: async (id: string) => {
    // 接続も削除
    const { connections } = get();
    const relatedConnIds = Object.values(connections)
      .filter(c => c.fromFragmentId === id || c.toFragmentId === id)
      .map(c => c.id);

    for (const cid of relatedConnIds) {
      await db.connections.delete(cid);
    }
    await db.fragments.delete(id);

    set(s => {
      const newFragments = { ...s.fragments };
      delete newFragments[id];
      const newConnections = { ...s.connections };
      for (const cid of relatedConnIds) delete newConnections[cid];
      return { fragments: newFragments, connections: newConnections };
    });
  },

  // =====================
  // Connection
  // =====================

  addConnection: async (fromId, toId, label = '') => {
    const { workspace } = get();
    if (!workspace) throw new Error('No workspace');
    const conn: Connection = {
      id: uuidv4(),
      workspaceId: workspace.id,
      fromFragmentId: fromId,
      toFragmentId: toId,
      label,
      style: 'solid',
      createdAt: new Date(),
    };
    await db.connections.add(conn);
    set(s => ({ connections: { ...s.connections, [conn.id]: conn } }));
    return conn.id;
  },

  updateConnectionLabel: (id, label) => {
    set(s => ({
      connections: {
        ...s.connections,
        [id]: s.connections[id] ? { ...s.connections[id], label } : s.connections[id],
      },
    }));
  },

  removeConnection: async (id) => {
    await db.connections.delete(id);
    set(s => {
      const newConns = { ...s.connections };
      delete newConns[id];
      return { connections: newConns };
    });
  },

  // =====================
  // Group
  // =====================

  createGroup: async (fragmentIds, title = '') => {
    const { workspace } = get();
    if (!workspace) throw new Error('No workspace');
    const group: FragmentGroup = {
      id: uuidv4(),
      workspaceId: workspace.id,
      title,
      color: 'blue',
      createdAt: new Date(),
    };
    await db.fragmentGroups.add(group);

    set(s => {
      const newFragments = { ...s.fragments };
      for (const fid of fragmentIds) {
        if (newFragments[fid]) {
          newFragments[fid] = { ...newFragments[fid], groupId: group.id };
        }
      }
      return {
        groups: { ...s.groups, [group.id]: group },
        fragments: newFragments,
      };
    });

    // persist fragment changes
    get()._persistFragments();
    return group.id;
  },

  dissolveGroup: (groupId) => {
    set(s => {
      const newFragments = { ...s.fragments };
      for (const [fid, frag] of Object.entries(newFragments)) {
        if (frag.groupId === groupId) {
          newFragments[fid] = { ...frag, groupId: null };
        }
      }
      const newGroups = { ...s.groups };
      delete newGroups[groupId];
      return { groups: newGroups, fragments: newFragments };
    });
    db.fragmentGroups.delete(groupId);
    get()._persistFragments();
  },

  updateGroupTitle: (groupId, title) => {
    set(s => ({
      groups: {
        ...s.groups,
        [groupId]: s.groups[groupId] ? { ...s.groups[groupId], title } : s.groups[groupId],
      },
    }));
  },

  // =====================
  // UI Actions
  // =====================

  setViewport: (partial) => {
    set(s => {
      const newVp = { ...s.viewport, ...partial };
      newVp.zoom = Math.max(0.3, Math.min(2.5, newVp.zoom));
      return { viewport: newVp };
    });
  },

  setInteraction: (mode) => set({ interaction: mode }),

  setToolMode: (mode) => set({ toolMode: mode, interaction: { type: 'idle' } }),

  selectFragment: (id, append = false) => {
    set(s => {
      const next = new Set(append ? s.selectedFragmentIds : []);
      next.add(id);
      return { selectedFragmentIds: next };
    });
  },

  clearSelection: () => set({ selectedFragmentIds: new Set() }),

  setHoveredFragment: (id) => set({ hoveredFragmentId: id }),

  // =====================
  // Persist helpers
  // =====================

  _persistFragments: async () => {
    const { fragments } = get();
    for (const frag of Object.values(fragments)) {
      await db.fragments.put(frag);
    }
  },

  _persistConnections: async () => {
    const { connections } = get();
    for (const conn of Object.values(connections)) {
      await db.connections.put(conn);
    }
  },
}));
