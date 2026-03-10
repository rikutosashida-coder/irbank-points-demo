import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, CreateNoteDto, UpdateNoteDto } from '../types/note.types';
import * as db from '../../../services/storage/indexedDB';

// フィルタ型
export type SortField = 'updatedAt' | 'title' | 'rating';
export type SortDirection = 'asc' | 'desc';

export interface NotesFilter {
  searchQuery: string;
  templateCategory: string | null;
  freeTags: string[];
  sortField: SortField;
  sortDirection: SortDirection;
}

const DEFAULT_FILTER: NotesFilter = {
  searchQuery: '',
  templateCategory: null,
  freeTags: [],
  sortField: 'updatedAt',
  sortDirection: 'desc',
};

interface NotesStore {
  // 状態
  notes: Record<string, Note>;
  currentNoteId: string | null;
  isLoading: boolean;
  error: string | null;

  // フィルタ・フォルダ
  filter: NotesFilter;
  currentFolderId: string | null;

  // アクション
  loadNotes: () => Promise<void>;
  createNote: (dto: CreateNoteDto) => Promise<string>;
  updateNote: (id: string, updates: UpdateNoteDto) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (id: string | null) => void;
  getNoteById: (id: string) => Note | undefined;

  // ページ階層操作
  addChildNote: (parentId: string, childId: string) => Promise<void>;
  removeChildNote: (parentId: string, childId: string) => Promise<void>;
  moveNote: (noteId: string, newParentId: string | null) => Promise<void>;

  // フォルダ操作
  createFolder: (name: string, parentId?: string | null) => Promise<string>;
  setCurrentFolder: (id: string | null) => void;

  // フィルタ操作
  setFilter: (partial: Partial<NotesFilter>) => void;
  resetFilter: () => void;

  // フィルタ・検索
  getFavoriteNotes: () => Note[];
  getActiveNotes: () => Note[];
  getRootNotes: () => Note[];
  getChildNotes: (parentId: string) => Note[];

  // その他
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  // 初期状態
  notes: {},
  currentNoteId: null,
  isLoading: false,
  error: null,
  filter: { ...DEFAULT_FILTER },
  currentFolderId: null,

  // ノートを読み込み
  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await db.getAllNotes();
      const notesMap = notes.reduce((acc, note) => {
        // 旧データ互換: parentId undefined → null、childrenIds undefined → []、noteType undefined → 'note'
        acc[note.id] = {
          ...note,
          parentId: note.parentId ?? null,
          childrenIds: note.childrenIds ?? [],
          noteType: note.noteType || 'note',
        };
        return acc;
      }, {} as Record<string, Note>);
      set({ notes: notesMap, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // ノートを作成
  createNote: async (dto: CreateNoteDto) => {
    // deep分析の場合は30日後に自動レビュー設定
    const nextReviewDate = dto.analysisDepth === 'deep'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : undefined;

    const newNote: Note = {
      id: uuidv4(),
      noteType: dto.noteType || 'note',
      title: dto.title,
      content: dto.content || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metaTags: [],
      anchorTags: dto.anchorTags || [],
      analysisTags: dto.analysisTags || [],
      freeTags: dto.freeTags || [],
      analysisItems: [],
      parentId: dto.parentId || null,
      childrenIds: [],
      isFavorite: false,
      isArchived: false,
      analysisDepth: dto.analysisDepth,
      ...(nextReviewDate ? { nextReviewDate } : {}),
    };

    try {
      await db.createNote(newNote);

      // 親ノートがある場合、親のchildrenIdsに追加
      if (newNote.parentId) {
        const parentNote = get().notes[newNote.parentId];
        if (parentNote) {
          await get().addChildNote(newNote.parentId, newNote.id);
        }
      }

      set((state) => ({
        notes: { ...state.notes, [newNote.id]: newNote },
      }));

      return newNote.id;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // ノートを更新
  updateNote: async (id: string, updates: UpdateNoteDto) => {
    try {
      await db.updateNote(id, updates);
      set((state) => ({
        notes: {
          ...state.notes,
          [id]: { ...state.notes[id], ...updates, updatedAt: new Date() },
        },
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // ノートを削除
  deleteNote: async (id: string) => {
    try {
      const note = get().notes[id];
      if (!note) return;

      // 親ノートから削除
      if (note.parentId) {
        await get().removeChildNote(note.parentId, id);
      }

      // 子ノートも削除
      for (const childId of (note.childrenIds || [])) {
        await get().deleteNote(childId);
      }

      await db.deleteNote(id);
      set((state) => {
        const newNotes = { ...state.notes };
        delete newNotes[id];
        return { notes: newNotes };
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // 現在のノートを設定
  setCurrentNote: (id: string | null) => {
    set({ currentNoteId: id });
  },

  // IDでノートを取得
  getNoteById: (id: string) => {
    return get().notes[id];
  },

  // 子ノートを追加
  addChildNote: async (parentId: string, childId: string) => {
    const parentNote = get().notes[parentId];
    if (!parentNote) return;

    const updatedChildrenIds = [...parentNote.childrenIds, childId];
    await get().updateNote(parentId, { childrenIds: updatedChildrenIds });
  },

  // 子ノートを削除
  removeChildNote: async (parentId: string, childId: string) => {
    const parentNote = get().notes[parentId];
    if (!parentNote) return;

    const updatedChildrenIds = parentNote.childrenIds.filter((id) => id !== childId);
    await get().updateNote(parentId, { childrenIds: updatedChildrenIds });
  },

  // ノートを移動
  moveNote: async (noteId: string, newParentId: string | null) => {
    const note = get().notes[noteId];
    if (!note) return;

    // 古い親から削除
    if (note.parentId) {
      await get().removeChildNote(note.parentId, noteId);
    }

    // 新しい親に追加
    if (newParentId) {
      await get().addChildNote(newParentId, noteId);
    }

    // ノートのparentIdを更新
    await get().updateNote(noteId, { parentId: newParentId });
  },

  // お気に入りのノートを取得
  getFavoriteNotes: () => {
    return Object.values(get().notes).filter((note) => note.isFavorite);
  },

  // アクティブなノート(アーカイブされていない)を取得
  getActiveNotes: () => {
    return Object.values(get().notes).filter((note) => !note.isArchived);
  },

  // ルートノート(親を持たない)を取得
  getRootNotes: () => {
    return Object.values(get().notes).filter((note) => note.parentId === null);
  },

  // 子ノートを取得
  getChildNotes: (parentId: string) => {
    return Object.values(get().notes).filter((note) => note.parentId === parentId);
  },

  // お気に入りを切り替え
  toggleFavorite: async (id: string) => {
    const note = get().notes[id];
    if (!note) return;

    await get().updateNote(id, { isFavorite: !note.isFavorite });
  },

  // アーカイブを切り替え
  toggleArchive: async (id: string) => {
    const note = get().notes[id];
    if (!note) return;

    await get().updateNote(id, { isArchived: !note.isArchived });
  },

  // フォルダ作成
  createFolder: async (name: string, parentId?: string | null) => {
    return get().createNote({
      title: name,
      noteType: 'folder',
      content: [],
      parentId: parentId ?? null,
    });
  },

  // フォルダナビゲーション
  setCurrentFolder: (id: string | null) => {
    set({ currentFolderId: id });
  },

  // フィルタ操作
  setFilter: (partial: Partial<NotesFilter>) => {
    set((state) => ({ filter: { ...state.filter, ...partial } }));
  },

  resetFilter: () => {
    set({ filter: { ...DEFAULT_FILTER } });
  },
}));
