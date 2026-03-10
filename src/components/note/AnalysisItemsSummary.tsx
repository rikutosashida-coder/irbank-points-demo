import { useState, useMemo, useCallback } from 'react';
import { FiZap, FiRefreshCw } from 'react-icons/fi';
import { AnalysisItem } from '../../features/notes/types/note.types';
import { generateOverviewSummary, AnalysisOverviewSummary } from '../../services/ai/analysisAiGenerator';

interface AnalysisItemsSummaryProps {
  analysisItems: AnalysisItem[];
}

/** ブロックコンテンツからプレーンテキストを抽出 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(blocks: any[], maxLen = 80): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.content && Array.isArray(block.content)) {
      for (const inline of block.content) {
        if (inline.text) parts.push(inline.text);
      }
    }
    if (parts.join('').length >= maxLen) break;
  }
  const full = parts.join('').trim();
  return full.length > maxLen ? full.slice(0, maxLen) + '...' : full;
}

/** {itemId:項目名} 形式のテキストを解析し、React ノードに変換 */
function renderSummaryText(
  text: string,
  itemMap: Map<string, AnalysisItem>,
  onClickItem: (itemId: string) => void,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\{([^:}]+):([^}]+)\}/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // マッチ前のテキスト
    if (match.index > lastIndex) {
      nodes.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }

    const itemId = match[1];
    const itemTitle = match[2];
    const item = itemMap.get(itemId);

    if (item) {
      const rating = item.rating || 0;
      const colorClass = rating >= 4
        ? 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
        : rating <= 2 && rating > 0
          ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
          : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100';

      nodes.push(
        <button
          key={key++}
          onClick={() => onClickItem(itemId)}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold rounded border ${colorClass} transition-colors cursor-pointer`}
          title={`「${itemTitle}」へジャンプ`}
        >
          {itemTitle}
          {rating > 0 && <span className="opacity-70">{rating}★</span>}
        </button>
      );
    } else {
      nodes.push(<span key={key++} className="font-semibold">{itemTitle}</span>);
    }

    lastIndex = match.index + match[0].length;
  }

  // 残りのテキスト
  if (lastIndex < text.length) {
    nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return nodes;
}

export function AnalysisItemsSummary({ analysisItems }: AnalysisItemsSummaryProps) {
  const [summary, setSummary] = useState<AnalysisOverviewSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // アイテムIDマップ
  const itemMap = useMemo(
    () => new Map(analysisItems.map(i => [i.id, i])),
    [analysisItems],
  );

  const generate = useCallback(async () => {
    if (analysisItems.length === 0) return;
    setIsGenerating(true);
    try {
      const input = analysisItems.map(item => {
        const cv = item.versions.find(v => v.id === item.currentVersionId);
        const excerpt = cv && cv.content.length > 0 ? extractText(cv.content) : '';
        return {
          id: item.id,
          title: item.title,
          rating: item.rating,
          weight: item.weight,
          excerpt,
          checkPoints: item.checkPoints?.map(cp => ({
            text: cp.text,
            isChecked: cp.isChecked,
            aiOutput: cp.aiOutput,
          })),
        };
      });
      const result = await generateOverviewSummary(input);
      setSummary(result);
    } catch (err) {
      console.error('[AnalysisItemsSummary] Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [analysisItems]);

  const handleScrollToItem = useCallback((itemId: string) => {
    const el = document.getElementById(`analysis-item-${itemId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // ハイライトアニメーション
      el.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2');
      }, 2000);
    }
  }, []);

  if (analysisItems.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiZap className="w-4 h-4 text-purple-500" />
          <h4 className="text-sm font-bold text-gray-800">AI総評</h4>
        </div>
        <button
          onClick={generate}
          disabled={isGenerating}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
          title="再生成"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? '生成中...' : '再生成'}
        </button>
      </div>

      {/* 要約テキスト */}
      <div className="px-5 py-4">
        {isGenerating ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
            重点度とチェックポイントから総評を生成中...
          </div>
        ) : summary ? (
          <p className="text-sm text-gray-700 leading-relaxed">
            {renderSummaryText(summary.text, itemMap, handleScrollToItem)}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            「再生成」をクリックすると、各項目の評価・重点度・チェックポイントからAI総評を生成します
          </p>
        )}
      </div>
    </div>
  );
}
