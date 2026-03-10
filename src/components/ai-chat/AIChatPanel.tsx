import { useState, useRef, useEffect, useCallback } from 'react';
import { FiX, FiSend, FiRefreshCw, FiChevronRight, FiMinus, FiMaximize2, FiPlus } from 'react-icons/fi';
import { useAIChatStore } from '../../features/ai-chat/store/aiChatStore';
import { ChatMessage } from './ChatMessage';
import { generateAIResponse } from '../../services/ai/aiService';
import type { ChatWindow } from '../../features/ai-chat/types/chat.types';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 300;

// ============================================
// チャット本体（共通UI: ドック・フロート両方で使用）
// ============================================

function ChatBody({ chatWindow }: { chatWindow: ChatWindow }) {
  const {
    addMessageToWindow,
    clearWindowSession,
  } = useAIChatStore();

  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { id, session } = chatWindow;

  // 自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.messages]);

  // 初回メッセージ
  useEffect(() => {
    if (session.messages.length === 0) {
      addMessageToWindow(id, {
        role: 'assistant',
        content: 'こんにちは！AIナビゲーターです。\n\n投資分析や銘柄調査のサポートをいたします。',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // フォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // メッセージ送信
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    const userMessage = inputValue.trim();
    setInputValue('');

    addMessageToWindow(id, { role: 'user', content: userMessage });

    setIsProcessing(true);
    try {
      const response = await generateAIResponse(userMessage, {
        noteTitle: session.noteContext?.noteTitle,
      });
      addMessageToWindow(id, { role: 'assistant', content: response.content });
    } catch {
      addMessageToWindow(id, {
        role: 'assistant',
        content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* コンテキスト表示 */}
      {session.noteContext && (
        <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 flex items-center gap-1.5 text-xs flex-shrink-0">
          <FiChevronRight className="w-3 h-3 text-blue-600 flex-shrink-0" />
          <span className="text-blue-700 font-medium">ノート:</span>
          <span className="text-blue-600 truncate">{session.noteContext.noteTitle}</span>
        </div>
      )}

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50 min-h-0">
        {session.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isProcessing && (
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="flex-1">
              <div className="inline-block px-3 py-1.5 rounded-2xl rounded-bl-sm bg-gray-100">
                <p className="text-xs text-gray-600">考え中...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t border-gray-200 bg-white p-2.5 flex-shrink-0">
        <div className="flex items-end gap-1.5">
          <button
            onClick={() => clearWindowSession(id)}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="新規チャット"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-24 text-xs"
            rows={1}
            style={{ height: 'auto', minHeight: '32px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="flex-shrink-0 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="送信"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-gray-400 text-center">
          Powered by Claude · モック版
        </p>
      </div>
    </>
  );
}

// ============================================
// ドックパネル（右側固定）
// ============================================

export function AIChatDockedPanel() {
  const { windows, closeWindow, floatWindow, openNewFloatingWindow } = useAIChatStore();
  const dockedWindow = windows.find(w => w.mode === 'docked');

  if (!dockedWindow) return null;

  return (
    <aside data-ai-chat-panel className="w-[360px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          <h2 className="font-semibold text-white text-xs truncate">AIナビゲーター</h2>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* 新しいフロートウィンドウを追加 */}
          <button
            onClick={() => openNewFloatingWindow()}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="フロートウィンドウを追加"
          >
            <FiPlus className="w-3.5 h-3.5" />
          </button>
          {/* フロート化 */}
          <button
            onClick={() => floatWindow(dockedWindow.id)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="フロートに切り離す"
          >
            <FiMaximize2 className="w-3.5 h-3.5" />
          </button>
          {/* 閉じる */}
          <button
            onClick={() => closeWindow(dockedWindow.id)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="閉じる"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* チャット本体 */}
      <ChatBody chatWindow={dockedWindow} />
    </aside>
  );
}

// ============================================
// フロートポップアップ コンテナ
// ============================================

export function AIChatFloatingPopups() {
  const { windows } = useAIChatStore();
  const floatingWindows = windows.filter(w => w.mode === 'floating');

  if (floatingWindows.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 900 }}>
      {floatingWindows.map(win => (
        <AIChatPopup key={win.id} chatWindow={win} />
      ))}
    </div>
  );
}

// ============================================
// 個別のフロートポップアップ
// ============================================

function AIChatPopup({ chatWindow }: { chatWindow: ChatWindow }) {
  const {
    closeWindow,
    bringToFront,
    updateWindowPosition,
    updateWindowSize,
    toggleMinimize,
  } = useAIChatStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { id, position, size, zIndex, isMinimized } = chatWindow;

  // ドラッグ処理
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    bringToFront(id);
  }, [position, bringToFront, id]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const x = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
      const y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragOffset.y));
      updateWindowPosition(id, { x, y });
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset, id, updateWindowPosition]);

  // リサイズ処理
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    bringToFront(id);
  }, [bringToFront, id]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const newW = Math.max(MIN_WIDTH, e.clientX - position.x);
      const newH = Math.max(MIN_HEIGHT, e.clientY - position.y);
      updateWindowSize(id, { width: newW, height: newH });
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, position, id, updateWindowSize]);

  return (
    <div
      data-ai-chat-panel
      className="pointer-events-auto absolute flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 260 : size.width,
        height: isMinimized ? 'auto' : size.height,
        zIndex,
      }}
      onMouseDown={() => bringToFront(id)}
    >
      {/* ヘッダー（ドラッグハンドル） */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          <h2 className="font-semibold text-white text-xs truncate">AIナビゲーター</h2>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => toggleMinimize(id)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={isMinimized ? '展開' : '最小化'}
          >
            <FiMinus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => closeWindow(id)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="閉じる"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ChatBody chatWindow={chatWindow} />

          {/* リサイズハンドル（右下角） */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
            onMouseDown={handleResizeStart}
          >
            <svg className="w-4 h-4 text-gray-300" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14Z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

// 後方互換: 旧 AIChatPanel エクスポート (フロートポップアップのみ)
export function AIChatPanel() {
  return <AIChatFloatingPopups />;
}
