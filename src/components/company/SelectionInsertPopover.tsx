import { useState, useEffect, useCallback, useRef } from 'react';
import { FiFileText, FiHelpCircle, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { useAIChatStore } from '../../features/ai-chat/store/aiChatStore';

interface SelectionInsertPopoverProps {
  /** テキスト選択 → ブロック変換 → ダイアログを開く */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInsertSelection: (blocks: any[], label: string) => void;
  /** ポップオーバーを表示する範囲の親要素 ref */
  containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * ページ上でテキストを選択すると、選択範囲の近くに
 * アクションメニューを表示するポップオーバー。
 *
 * - ノートに追加: 選択テキストを BlockNote ブロックに変換して挿入
 * - 意味を聞く / 競合と比較する / 分析する: AIナビゲーターにプロンプトを送信
 */
export function SelectionInsertPopover({ onInsertSelection, containerRef }: SelectionInsertPopoverProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const { openPanel, addMessage } = useAIChatStore();

  const handleMouseUp = useCallback(() => {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 2) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      if (!anchorNode || !focusNode) return;
      if (!container.contains(anchorNode) && !container.contains(focusNode)) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      if (popoverRef.current?.contains(anchorNode as Node)) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // 画面端からはみ出さないよう補正
      const x = Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2));
      const y = rect.top - 8;

      setPosition({ x, y });
      setSelectedText(text);
    });
  }, [containerRef]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (popoverRef.current?.contains(e.target as Node)) return;
    setPosition(null);
    setSelectedText('');
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  const dismiss = useCallback(() => {
    setPosition(null);
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  }, []);

  // ノートに追加
  const handleInsertToNote = useCallback(() => {
    if (!selectedText) return;
    const lines = selectedText.split('\n').map(l => l.trim()).filter(Boolean);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocks: any[] = lines.map(line => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line, styles: {} }],
    }));
    onInsertSelection(blocks, '選択テキスト');
    dismiss();
  }, [selectedText, onInsertSelection, dismiss]);

  // AIナビゲーターにプロンプトを送信
  const sendToAI = useCallback((prompt: string) => {
    openPanel();
    addMessage({ role: 'user', content: prompt });
    dismiss();
  }, [openPanel, addMessage, dismiss]);

  const handleAskMeaning = useCallback(() => {
    sendToAI(`以下の内容の意味を分かりやすく教えてください。\n\n「${selectedText}」`);
  }, [selectedText, sendToAI]);

  const handleCompareCompetitors = useCallback(() => {
    sendToAI(`以下の内容について、競合他社と比較して解説してください。\n\n「${selectedText}」`);
  }, [selectedText, sendToAI]);

  const handleAnalyze = useCallback(() => {
    sendToAI(`以下の内容を投資分析の観点から詳しく分析してください。\n\n「${selectedText}」`);
  }, [selectedText, sendToAI]);

  if (!position || !selectedText) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* ノートに追加 */}
        <button
          onClick={handleInsertToNote}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          <FiFileText className="w-3.5 h-3.5 text-blue-400" />
          ノートに追加
        </button>

        {/* 区切り線 + AIセクション */}
        <div className="border-t border-gray-600">
          <div className="px-4 py-1.5 text-[10px] text-gray-400 font-medium tracking-wide">
            AIナビゲーター
          </div>

          <button
            onClick={handleAskMeaning}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            <FiHelpCircle className="w-3.5 h-3.5 text-green-400" />
            意味を聞く
          </button>

          <button
            onClick={handleCompareCompetitors}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            <FiUsers className="w-3.5 h-3.5 text-orange-400" />
            競合と比較する
          </button>

          <button
            onClick={handleAnalyze}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            <FiBarChart2 className="w-3.5 h-3.5 text-purple-400" />
            分析する
          </button>
        </div>
      </div>

      {/* 下向き矢印 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          top: '100%',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #1f2937',
        }}
      />
    </div>
  );
}
