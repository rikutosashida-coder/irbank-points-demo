import { useState, useEffect, useCallback, useRef } from 'react';
import { FiHelpCircle, FiTrendingUp, FiLink, FiLayers } from 'react-icons/fi';
import { useAIChatStore } from '../../features/ai-chat/store/aiChatStore';
import { generateAIResponse } from '../../services/ai/aiService';

interface PopupPosition {
  x: number;
  y: number;
}

const ACTIONS = [
  { id: 'question', icon: FiHelpCircle, label: '質問', color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'compare', icon: FiLayers, label: '比較', color: 'bg-purple-600 hover:bg-purple-700' },
  { id: 'trend', icon: FiTrendingUp, label: '推移', color: 'bg-green-600 hover:bg-green-700' },
  { id: 'source', icon: FiLink, label: 'ソース元', color: 'bg-orange-600 hover:bg-orange-700' },
] as const;

type ActionId = typeof ACTIONS[number]['id'];

function buildPrompt(actionId: ActionId, selectedText: string): string {
  switch (actionId) {
    case 'question':
      return `以下について教えてください：\n\n「${selectedText}」`;
    case 'compare':
      return `以下について、関連する他の指標や企業と比較してください：\n\n「${selectedText}」`;
    case 'trend':
      return `以下の推移・トレンドについて分析してください：\n\n「${selectedText}」`;
    case 'source':
      return `以下の情報のソース元（東証・金融庁の公式情報、有価証券報告書等）を教えてください：\n\n「${selectedText}」`;
  }
}

export function TextSelectionAIPopup() {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<PopupPosition | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);

  const {
    windows,
    toggleDockedPanel,
    addMessageToWindow,
  } = useAIChatStore();

  const handleMouseUp = useCallback(() => {
    // 少し遅延させてselectionが確定するのを待つ
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length < 2) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      // ポップアップ自体の中のクリックは無視
      const anchorNode = selection?.anchorNode;
      if (anchorNode && popupRef.current?.contains(anchorNode as Node)) return;

      // AI チャットパネル内のテキスト選択は無視
      const anchorEl = anchorNode instanceof HTMLElement ? anchorNode : anchorNode?.parentElement;
      if (anchorEl?.closest('[data-ai-chat-panel]')) return;

      const range = selection?.getRangeAt(0);
      if (!range) return;

      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      });
    }, 10);
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // ポップアップ内のクリックは閉じない
    if (popupRef.current?.contains(e.target as Node)) return;
    setPosition(null);
    setSelectedText('');
  }, []);

  const handleScroll = useCallback(() => {
    setPosition(null);
    setSelectedText('');
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [handleMouseUp, handleMouseDown, handleScroll]);

  const handleAction = useCallback(async (actionId: ActionId) => {
    if (isProcessingRef.current || !selectedText) return;
    isProcessingRef.current = true;

    const prompt = buildPrompt(actionId, selectedText);

    // ドックパネルがなければ開く
    const docked = windows.find(w => w.mode === 'docked');
    if (!docked) {
      toggleDockedPanel();
    }

    // store が更新されるのを少し待つ
    await new Promise(r => setTimeout(r, 50));

    const store = useAIChatStore.getState();
    const dockedWindow = store.windows.find(w => w.mode === 'docked');
    if (!dockedWindow) {
      isProcessingRef.current = false;
      return;
    }

    // ユーザーメッセージを追加
    store.addMessageToWindow(dockedWindow.id, {
      role: 'user',
      content: prompt,
    });

    // ポップアップを閉じる
    setPosition(null);
    setSelectedText('');

    // AI応答を生成
    try {
      const response = await generateAIResponse(prompt);
      useAIChatStore.getState().addMessageToWindow(dockedWindow.id, {
        role: 'assistant',
        content: response.content,
      });
    } catch {
      useAIChatStore.getState().addMessageToWindow(dockedWindow.id, {
        role: 'assistant',
        content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
      });
    }

    isProcessingRef.current = false;
  }, [selectedText, windows, toggleDockedPanel, addMessageToWindow]);

  if (!position || !selectedText) return null;

  // 画面端からはみ出さないように調整
  const popupWidth = 280;
  const adjustedX = Math.max(popupWidth / 2 + 8, Math.min(window.innerWidth - popupWidth / 2 - 8, position.x));
  const adjustedY = Math.min(window.innerHeight - 60, position.y);

  return (
    <div
      ref={popupRef}
      className="fixed z-[9999] pointer-events-auto"
      style={{
        left: adjustedX,
        top: adjustedY,
        transform: 'translateX(-50%)',
      }}
    >
      {/* 吹き出し矢印 */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 rounded-sm" />

      {/* ボタン群 */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1.5 shadow-2xl">
        {ACTIONS.map(action => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${action.color}`}
            title={`「${selectedText.slice(0, 20)}${selectedText.length > 20 ? '...' : ''}」について${action.label}`}
          >
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
