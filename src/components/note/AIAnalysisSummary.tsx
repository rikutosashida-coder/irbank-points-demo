import { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiStar, FiZap } from 'react-icons/fi';
import { AnalysisItem } from '../../features/notes/types/note.types';
import { generateItemSummary } from '../../utils/blockNoteUtils';

interface AIAnalysisSummaryProps {
  analysisItems: AnalysisItem[];
}

export function AIAnalysisSummary({ analysisItems }: AIAnalysisSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!analysisItems || analysisItems.length === 0) {
    return null;
  }

  // 各項目の要約を生成
  const itemSummaries = analysisItems.map(item => {
    const currentVersion = item.versions.find(v => v.id === item.currentVersionId);
    const content = currentVersion?.content || [];
    const summary = generateItemSummary(item.title, content);

    return {
      id: item.id,
      title: item.title,
      summary,
      rating: item.rating,
      weight: item.weight,
    };
  });

  return (
    <div className="mb-8 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-100/50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FiZap className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">AI要約</h3>
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            {analysisItems.length}項目
          </span>
        </div>
        <button className="p-1 hover:bg-blue-200 rounded transition-colors">
          {isExpanded ? (
            <FiChevronDown className="w-5 h-5 text-blue-700" />
          ) : (
            <FiChevronRight className="w-5 h-5 text-blue-700" />
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {itemSummaries.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Rating */}
                  {item.rating && item.rating > 0 && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < (item.rating ?? 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Weight */}
                  {item.weight && item.weight !== 5 && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      重要度: {item.weight}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed pl-8">
                {item.summary}
              </p>
            </div>
          ))}

          <div className="mt-4 p-3 bg-blue-100/50 rounded border border-blue-200">
            <p className="text-xs text-blue-800 flex items-center gap-2">
              <FiZap className="w-3 h-3" />
              この要約は各分析項目の内容から自動生成されています
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
