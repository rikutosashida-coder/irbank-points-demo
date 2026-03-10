import { useState, useEffect } from 'react';
import { FiX, FiSave, FiZap } from 'react-icons/fi';
import { useVocabularyStore } from '../../features/notes/store/vocabularyStore';

interface VocabularyPopupProps {
  selectedText: string;
  noteId?: string;
  onClose: () => void;
  position: { x: number; y: number };
}

export function VocabularyPopup({ selectedText, noteId, onClose, position }: VocabularyPopupProps) {
  const [word, setWord] = useState(selectedText);
  const [meaning, setMeaning] = useState('');
  const [formula, setFormula] = useState(''); // 数式欄
  const [isLoading, setIsLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  const addEntry = useVocabularyStore((state) => state.addEntry);

  // AI自動生成ボタンクリック（Claude Codeを使用）
  const handleAIGenerate = async () => {
    setIsLoading(true);
    try {
      // Note: 実際の実装では、ここでWebSearchまたはWebFetchツールを呼び出します
      // 現在はモック実装として、簡易的な応答を返します

      // 金融用語の簡易辞書
      const financialTerms: Record<string, string> = {
        'ROE': '自己資本利益率。株主資本の収益性指標',
        'ROA': '総資産利益率。資産の収益性指標',
        'PER': '株価収益率。株価の割安度指標',
        'PBR': '株価純資産倍率。純資産との比較指標',
        'EBITDA': '利払税引償却前利益。本業収益力',
        '営業CF': '本業の現金創出力を示す指標',
        '投資CF': '設備投資等の資金流出入',
        '財務CF': '資金調達・返済の流出入',
        '販管費': '販売費及び一般管理費。営業費用',
        '流動比率': '短期支払能力。流動資産÷流動負債',
        '自己資本比率': '財務安全性。自己資本÷総資本',
        'DCF': '将来CFの現在価値評価法',
        'WACC': '加重平均資本コスト',
        'IRR': '内部収益率。投資判断指標',
        'NPV': '正味現在価値。投資価値評価',
      };

      const lowerWord = word.trim().toLowerCase();
      let generatedMeaning = '';

      // 辞書から検索
      for (const [term, definition] of Object.entries(financialTerms)) {
        if (term.toLowerCase() === lowerWord || lowerWord.includes(term.toLowerCase())) {
          generatedMeaning = definition;
          break;
        }
      }

      // 辞書になければデフォルトメッセージ
      if (!generatedMeaning) {
        generatedMeaning = `${word}の定義を入力してください`;
      }

      setMeaning(generatedMeaning);
      setIsAIGenerated(true);
    } catch (error) {
      console.error('AI意味生成エラー:', error);
      setMeaning('意味の生成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // 保存ボタンクリック
  const handleSave = async () => {
    if (!word.trim() || !meaning.trim()) return;

    try {
      await addEntry({
        word: word.trim(),
        meaning: meaning.trim(),
        formula: formula.trim() || undefined,
        noteId,
        sourceText: selectedText,
        isAIGenerated,
      });
      onClose();
    } catch (error) {
      console.error('単語の保存に失敗しました:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  // Escapeキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* ポップアップ */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-[400px]"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          transform: 'translate(-50%, 10px)',
        }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">単語を登録</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="閉じる"
          >
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-4">
          {/* 単語入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              単語・用語
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: ROE"
              autoFocus
            />
          </div>

          {/* 数式入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              数式（任意）
            </label>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="例: 当期純利益 ÷ 自己資本 × 100"
            />
          </div>

          {/* 意味入力 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                意味・説明
              </label>
              <button
                onClick={handleAIGenerate}
                disabled={isLoading || !word.trim()}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <FiZap className="w-3 h-3" />
                {isLoading ? '生成中...' : 'AIで自動生成'}
              </button>
            </div>
            <textarea
              value={meaning}
              onChange={(e) => {
                setMeaning(e.target.value);
                setIsAIGenerated(false);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
              placeholder="意味や説明を入力してください"
              maxLength={30}
            />
            <div className="flex items-center justify-between mt-1">
              {isAIGenerated && (
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <FiZap className="w-3 h-3" />
                  AI生成
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {meaning.length}/30文字
              </p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!word.trim() || !meaning.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <FiSave className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </>
  );
}
