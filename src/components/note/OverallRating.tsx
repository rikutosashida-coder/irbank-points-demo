import { useState, ReactNode } from 'react';
import { FiStar, FiEdit2, FiX } from 'react-icons/fi';
import { AnalysisItem, AnchorTag, AnalysisTag } from '../../features/notes/types/note.types';

const INITIAL_DISPLAY_COUNT = 5;

interface OverallRatingProps {
  analysisItems: AnalysisItem[];
  onUpdateWeight?: (itemId: string, weight: number) => void;
  anchorTags?: AnchorTag[];
  analysisTags?: AnalysisTag[];
  freeTags?: string[];
  onAnchorTagClick?: (stockCode: string) => void;
  tagEditor?: ReactNode;
}

export function OverallRating({ analysisItems, onUpdateWeight, anchorTags, analysisTags, freeTags, onAnchorTagClick, tagEditor }: OverallRatingProps) {
  const [expanded, setExpanded] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);

  // 評価が設定されている項目のみ抽出
  const ratedItems = analysisItems.filter(item => item.rating !== undefined && item.rating > 0);

  // 総合評価を重み付き平均で計算
  const overallRating = ratedItems.length > 0
    ? ratedItems.reduce((sum, item) => {
        const weight = item.weight || 5;
        const rating = item.rating || 0;
        return sum + (rating * weight);
      }, 0) / ratedItems.reduce((sum, item) => sum + (item.weight || 5), 0)
    : 0;

  if (analysisItems.length === 0) {
    return null;
  }

  const hasTags = (anchorTags && anchorTags.length > 0) ||
    (analysisTags && analysisTags.length > 0) ||
    (freeTags && freeTags.length > 0);

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      {/* 総合評価ライン */}
      <div className="flex items-start gap-4 mb-4">
        {/* 円グラフ */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-white shadow-md flex flex-col items-center justify-center border-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">
              {overallRating.toFixed(1)}
            </div>
            <div className="text-[10px] text-gray-500">/ 5.0</div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex items-center gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(overallRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm font-bold text-gray-800 ml-1">{overallRating.toFixed(1)}</span>
          </div>
          <p className="text-xs text-gray-500">
            {ratedItems.length}項目 / 全{analysisItems.length}項目
          </p>
          {ratedItems.length < analysisItems.length && (
            <p className="text-[11px] text-gray-400">
              {analysisItems.length - ratedItems.length}項目が未評価
            </p>
          )}
        </div>

        {/* タグ表示 / タグ編集エリア */}
        <div className="flex-1 ml-2">
          {showTagEditor && tagEditor ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">タグを編集</h3>
                <button
                  onClick={() => setShowTagEditor(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  title="閉じる"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              {tagEditor}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {anchorTags?.map((tag) =>
                tag.stockCode ? (
                  <button
                    key={tag.id}
                    onClick={() => onAnchorTagClick?.(tag.stockCode!)}
                    className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    {tag.stockName} ({tag.stockCode}) →
                  </button>
                ) : (
                  <span
                    key={tag.id}
                    className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                  >
                    {tag.stockName || tag.industryName || tag.themeName}
                  </span>
                )
              )}
              {analysisTags?.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800"
                >
                  {tag.phase === 'before_investment' ? '投資判断前' : '投資判断後'}
                </span>
              ))}
              {freeTags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800"
                >
                  {tag}
                </span>
              ))}
              {tagEditor && (
                <button
                  onClick={() => setShowTagEditor(true)}
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="タグを編集"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {!hasTags && tagEditor && (
                <button
                  onClick={() => setShowTagEditor(true)}
                  className="text-sm text-gray-400 hover:text-primary-600 hover:underline"
                >
                  タグを追加
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 分析項目タグ */}
      {ratedItems.length > 0 && (() => {
        const sorted = [...ratedItems].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        const visible = expanded ? sorted : sorted.slice(0, INITIAL_DISPLAY_COUNT);
        const hiddenCount = sorted.length - INITIAL_DISPLAY_COUNT;

        return (
          <div className="flex flex-wrap gap-2 items-center">
            {visible.map((item) => (
              <div
                key={item.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-100"
              >
                <button
                  onClick={() => {
                    document.getElementById(`analysis-item-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="hover:underline cursor-pointer"
                >
                  {item.title}
                </button>
                <span className="text-yellow-500 font-semibold">{item.rating}★</span>
                {onUpdateWeight ? (
                  <select
                    value={item.weight || 5}
                    onChange={(e) => onUpdateWeight(item.id, Number(e.target.value))}
                    className="text-[11px] text-blue-500 bg-transparent border border-blue-200 rounded px-1 py-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300"
                    title="重要度 (1-10)"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-blue-400 text-xs">(重要度:{item.weight || 5})</span>
                )}
              </div>
            ))}
            {hiddenCount > 0 && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                ・・・ 他{hiddenCount}件
              </button>
            )}
            {expanded && hiddenCount > 0 && (
              <button
                onClick={() => setExpanded(false)}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                閉じる
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
}
