export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  noteContext?: {
    noteId: string;
    noteTitle: string;
  };
}

export interface ChatWindow {
  id: string;
  session: ChatSession;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  mode: 'docked' | 'floating';
}
