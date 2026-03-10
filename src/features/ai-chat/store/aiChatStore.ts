import { create } from 'zustand';
import { ChatMessage, ChatSession, ChatWindow } from '../types/chat.types';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 480;
const DOCKED_WIDTH = 360;

interface AIChatStore {
  // ウィンドウ管理
  windows: ChatWindow[];
  nextZIndex: number;

  // 後方互換
  isOpen: boolean;
  currentSession: ChatSession | null;

  // ドックパネル操作
  toggleDockedPanel: (noteContext?: { noteId: string; noteTitle: string }) => void;
  getDockedWindow: () => ChatWindow | undefined;

  // フロート操作
  floatWindow: (windowId: string) => void;
  openNewFloatingWindow: (noteContext?: { noteId: string; noteTitle: string }) => string;

  // 共通ウィンドウ操作
  closeWindow: (windowId: string) => void;
  bringToFront: (windowId: string) => void;
  updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
  updateWindowSize: (windowId: string, size: { width: number; height: number }) => void;
  toggleMinimize: (windowId: string) => void;

  // メッセージ操作
  addMessageToWindow: (windowId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearWindowSession: (windowId: string) => void;

  // 旧API互換
  openNewWindow: (noteContext?: { noteId: string; noteTitle: string }) => string;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string, isStreaming?: boolean) => void;
  clearCurrentSession: () => void;
  startNewSession: (noteContext?: { noteId: string; noteTitle: string }) => void;
}

function createSession(noteContext?: { noteId: string; noteTitle: string }): ChatSession {
  return {
    id: uuidv4(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    noteContext,
  };
}

function createDockedWindow(noteContext?: { noteId: string; noteTitle: string }): ChatWindow {
  return {
    id: uuidv4(),
    session: createSession(noteContext),
    position: { x: 0, y: 0 }, // ドックでは使わない
    size: { width: DOCKED_WIDTH, height: 0 }, // ドックでは高さは親で決まる
    zIndex: 0,
    isMinimized: false,
    mode: 'docked',
  };
}

function createFloatingWindow(
  noteContext?: { noteId: string; noteTitle: string },
  zIndex = 1000,
  offset = 0,
): ChatWindow {
  return {
    id: uuidv4(),
    session: createSession(noteContext),
    position: {
      x: Math.min(window.innerWidth - DEFAULT_WIDTH - 20, 200 + offset * 30),
      y: Math.min(window.innerHeight - DEFAULT_HEIGHT - 20, 100 + offset * 30),
    },
    size: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
    zIndex,
    isMinimized: false,
    mode: 'floating',
  };
}

function syncCompat(windows: ChatWindow[]) {
  return {
    isOpen: windows.length > 0,
    currentSession: windows.length > 0 ? windows[windows.length - 1].session : null,
  };
}

export const useAIChatStore = create<AIChatStore>((set, get) => ({
  windows: [],
  nextZIndex: 1000,
  isOpen: false,
  currentSession: null,

  // =====================
  // ドックパネル トグル
  // =====================
  toggleDockedPanel: (noteContext) => {
    const { windows } = get();
    const docked = windows.find(w => w.mode === 'docked');
    if (docked) {
      // ドックを閉じる
      const updated = windows.filter(w => w.id !== docked.id);
      set({ windows: updated, ...syncCompat(updated) });
    } else {
      // ドックを開く
      const win = createDockedWindow(noteContext);
      const updated = [...windows, win];
      set({ windows: updated, ...syncCompat(updated) });
    }
  },

  getDockedWindow: () => {
    return get().windows.find(w => w.mode === 'docked');
  },

  // =====================
  // フロート化
  // =====================
  floatWindow: (windowId) => {
    const { windows, nextZIndex } = get();
    const floatingCount = windows.filter(w => w.mode === 'floating').length;
    set({
      windows: windows.map(w => {
        if (w.id !== windowId) return w;
        return {
          ...w,
          mode: 'floating' as const,
          position: {
            x: Math.min(window.innerWidth - DEFAULT_WIDTH - 20, 200 + floatingCount * 30),
            y: Math.min(window.innerHeight - DEFAULT_HEIGHT - 20, 100 + floatingCount * 30),
          },
          size: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
          zIndex: nextZIndex,
        };
      }),
      nextZIndex: nextZIndex + 1,
    });
  },

  openNewFloatingWindow: (noteContext) => {
    const { windows, nextZIndex } = get();
    const floatingCount = windows.filter(w => w.mode === 'floating').length;
    const win = createFloatingWindow(noteContext, nextZIndex, floatingCount);
    const updated = [...windows, win];
    set({
      windows: updated,
      nextZIndex: nextZIndex + 1,
      ...syncCompat(updated),
    });
    return win.id;
  },

  // =====================
  // 共通ウィンドウ操作
  // =====================
  closeWindow: (windowId) => {
    const updated = get().windows.filter(w => w.id !== windowId);
    set({ windows: updated, ...syncCompat(updated) });
  },

  bringToFront: (windowId) => {
    const { nextZIndex } = get();
    set({
      windows: get().windows.map(w =>
        w.id === windowId ? { ...w, zIndex: nextZIndex } : w
      ),
      nextZIndex: nextZIndex + 1,
    });
  },

  updateWindowPosition: (windowId, position) => {
    set({
      windows: get().windows.map(w =>
        w.id === windowId ? { ...w, position } : w
      ),
    });
  },

  updateWindowSize: (windowId, size) => {
    set({
      windows: get().windows.map(w =>
        w.id === windowId ? { ...w, size } : w
      ),
    });
  },

  toggleMinimize: (windowId) => {
    set({
      windows: get().windows.map(w =>
        w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
      ),
    });
  },

  addMessageToWindow: (windowId, message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };
    set({
      windows: get().windows.map(w => {
        if (w.id !== windowId) return w;
        const updatedSession = {
          ...w.session,
          messages: [...w.session.messages, newMessage],
          updatedAt: new Date(),
        };
        return { ...w, session: updatedSession };
      }),
    });
  },

  clearWindowSession: (windowId) => {
    set({
      windows: get().windows.map(w => {
        if (w.id !== windowId) return w;
        return {
          ...w,
          session: {
            id: uuidv4(),
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            noteContext: w.session.noteContext,
          },
        };
      }),
    });
  },

  // ===== 旧API互換 =====
  openNewWindow: (noteContext) => {
    return get().openNewFloatingWindow(noteContext);
  },

  togglePanel: () => {
    get().toggleDockedPanel();
  },

  openPanel: () => {
    const { windows } = get();
    if (!windows.some(w => w.mode === 'docked')) {
      get().toggleDockedPanel();
    }
  },

  closePanel: () => {
    set({ windows: [], isOpen: false, currentSession: null });
  },

  startNewSession: (noteContext) => {
    get().openNewFloatingWindow(noteContext);
  },

  addMessage: (message) => {
    const { windows } = get();
    if (windows.length === 0) {
      get().toggleDockedPanel();
      return get().addMessage(message);
    }
    const lastWindow = windows[windows.length - 1];
    get().addMessageToWindow(lastWindow.id, message);
  },

  updateLastMessage: (content, isStreaming) => {
    const { windows } = get();
    if (windows.length === 0) return;
    const lastWindow = windows[windows.length - 1];
    const messages = lastWindow.session.messages;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;

    set({
      windows: windows.map(w => {
        if (w.id !== lastWindow.id) return w;
        const updatedMessages = [...w.session.messages];
        updatedMessages[updatedMessages.length - 1] = { ...lastMsg, content, isStreaming };
        return {
          ...w,
          session: { ...w.session, messages: updatedMessages, updatedAt: new Date() },
        };
      }),
    });
  },

  clearCurrentSession: () => {
    const { windows } = get();
    if (windows.length === 0) return;
    get().clearWindowSession(windows[windows.length - 1].id);
  },
}));
