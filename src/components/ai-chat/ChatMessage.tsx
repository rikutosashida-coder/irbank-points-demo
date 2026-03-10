import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../features/ai-chat/types/chat.types';
import { FiUser, FiCpu, FiCopy } from 'react-icons/fi';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [isDragging, setIsDragging] = useState(false);

  // ドラッグ開始時に選択されたテキストを取得
  const handleDragStart = (e: React.DragEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText) {
      // 選択されたテキストをドラッグ
      e.dataTransfer.setData('text/plain', selectedText);
      e.dataTransfer.effectAllowed = 'copy';
      setIsDragging(true);
    } else {
      // 選択がない場合はメッセージ全体をドラッグ
      e.dataTransfer.setData('text/plain', message.content);
      e.dataTransfer.effectAllowed = 'copy';
      setIsDragging(true);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // コピーボタン（AI応答のみ）
  const handleCopy = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    const textToCopy = selectedText || message.content;

    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* アバター */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'
        }`}
      >
        {isUser ? (
          <FiUser className="w-4 h-4 text-white" />
        ) : (
          <FiCpu className="w-4 h-4 text-white" />
        )}
      </div>

      {/* メッセージ */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className="relative group">
          <div
            draggable={!isUser}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`inline-block px-4 py-2 rounded-2xl ${
              isUser
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm cursor-grab active:cursor-grabbing'
            } ${isDragging ? 'opacity-50' : ''}`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed select-text">
              {message.content}
            </p>
            {message.isStreaming && (
              <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>

          {/* コピーボタン（AI応答のみ） */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded-full p-1.5 shadow-sm hover:bg-gray-50"
              title="コピー"
            >
              <FiCopy className="w-3 h-3 text-gray-600" />
            </button>
          )}
        </div>

        {/* タイムスタンプ */}
        <div className="mt-1 px-2">
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && (
            <span className="text-xs text-gray-400 ml-2">
              ドラッグしてノートに貼り付け
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
