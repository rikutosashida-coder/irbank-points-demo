import { useState } from 'react';
import { FiTrash2, FiEdit2, FiCalendar, FiFileText, FiStar, FiChevronDown, FiChevronRight, FiLink } from 'react-icons/fi';
import { InvestmentDecision, DECISION_TYPE_LABELS, DECISION_TYPE_COLORS } from '../../features/notes/types/investment.types';
import { useInvestmentDecisionStore } from '../../features/notes/store/investmentDecisionStore';
import { useNotesStore } from '../../features/notes/store/notesStore';
import { useNavigate } from 'react-router-dom';

interface InvestmentDecisionCardProps {
  decision: InvestmentDecision;
  onEdit?: (decisionId: string) => void;
  showNoteLink?: boolean; // ノートリンクを表示するか（ダッシュボード等から使う場合）
}

export function InvestmentDecisionCard({ decision, onEdit, showNoteLink }: InvestmentDecisionCardProps) {
  const deleteDecision = useInvestmentDecisionStore((state) => state.deleteDecision);
  const getNoteById = useNotesStore((state) => state.getNoteById);
  const navigate = useNavigate();
  const [showSnapshot, setShowSnapshot] = useState(false);

  const note = getNoteById(decision.noteId);
  const relatedAnalysisItems = note?.analysisItems.filter(item =>
    decision.relatedAnalysisItemIds?.includes(item.id)
  ) || [];

  const snapshot = decision.analysisSnapshot;

  const handleDelete = () => {
    if (confirm('この投資判断を削除しますか？')) {
      deleteDecision(decision.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full border ${
              DECISION_TYPE_COLORS[decision.decisionType]
            }`}
          >
            {DECISION_TYPE_LABELS[decision.decisionType]}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FiCalendar className="w-3.5 h-3.5" />
            {new Date(decision.decisionDate).toLocaleDateString('ja-JP')}
          </div>
        </div>

        {/* アクション */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(decision.id)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="編集"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="削除"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 由来ノートリンク（外部からの表示時） */}
      {showNoteLink && snapshot && (
        <button
          onClick={() => navigate(`/mypage/note/${decision.noteId}`)}
          className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors w-full text-left"
        >
          <FiLink className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-medium truncate">{snapshot.noteTitle}</span>
          {snapshot.stockName && (
            <span className="text-xs text-blue-500 flex-shrink-0">({snapshot.stockName})</span>
          )}
        </button>
      )}

      {/* 判断理由 */}
      {decision.reason && (
        <div className="mb-3">
          <p className="text-sm text-gray-700 leading-relaxed">{decision.reason}</p>
        </div>
      )}

      {/* 関連する分析項目 */}
      {relatedAnalysisItems.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-2">
            <FiFileText className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">関連する分析項目</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedAnalysisItems.map((item) => (
              <span
                key={item.id}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200"
              >
                {item.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 分析スナップショット（由来情報） */}
      {snapshot && (
        <div className="mb-3">
          <button
            onClick={() => setShowSnapshot(!showSnapshot)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            {showSnapshot ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronRight className="w-3.5 h-3.5" />}
            判断時の分析状態を見る
          </button>

          {showSnapshot && (
            <div className="mt-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-100 space-y-2">
              {/* ノートタイトルと分析日 */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-800">{snapshot.noteTitle}</span>
                <span className="text-xs text-gray-500">
                  分析: {new Date(snapshot.analysisDate).toLocaleDateString('ja-JP')}
                </span>
              </div>

              {/* 銘柄 */}
              {(snapshot.stockName || snapshot.stockCode) && (
                <div className="text-xs text-gray-600">
                  銘柄: {snapshot.stockName}{snapshot.stockCode ? ` (${snapshot.stockCode})` : ''}
                </div>
              )}

              {/* 総合スコア */}
              {snapshot.overallScore !== undefined && snapshot.overallScore > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">総合評価:</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FiStar
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(snapshot.overallScore!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-indigo-700">
                    {snapshot.overallScore.toFixed(1)}
                  </span>
                </div>
              )}

              {/* 分析項目の評価 */}
              {snapshot.analysisItemRatings.filter(r => r.rating && r.rating > 0).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {snapshot.analysisItemRatings
                    .filter(r => r.rating && r.rating > 0)
                    .map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white rounded border border-indigo-200"
                      >
                        {item.title}
                        <span className="text-yellow-600 font-semibold">{item.rating}★</span>
                      </span>
                    ))
                  }
                </div>
              )}

              {/* 要約 */}
              {snapshot.noteSummary && (
                <p className="text-xs text-gray-600 line-clamp-2 italic">
                  "{snapshot.noteSummary}"
                </p>
              )}

              {/* キーワード */}
              {snapshot.keywords && snapshot.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {snapshot.keywords.slice(0, 5).map((kw, i) => (
                    <span key={i} className="px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 取引詳細 */}
      {decision.tradeDetails && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {decision.decisionType === 'buy' ? '購入' : '売却'}詳細
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* 実行日 */}
            <div>
              <p className="text-xs text-gray-500">実行日</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(decision.tradeDetails.executeDate).toLocaleDateString('ja-JP')}
              </p>
            </div>

            {/* 株価 */}
            <div>
              <p className="text-xs text-gray-500">1株あたり</p>
              <p className="text-sm font-medium text-gray-900">
                ¥{decision.tradeDetails.pricePerShare.toLocaleString()}
              </p>
            </div>

            {/* 株数 */}
            <div>
              <p className="text-xs text-gray-500">株数</p>
              <p className="text-sm font-medium text-gray-900">
                {decision.tradeDetails.shares.toLocaleString()}株
              </p>
            </div>

            {/* 総額 */}
            <div>
              <p className="text-xs text-gray-500">総額</p>
              <p className="text-sm font-bold text-blue-600">
                ¥{decision.tradeDetails.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* メタ情報 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          記録日: {new Date(decision.createdAt).toLocaleDateString('ja-JP')}
        </p>
      </div>
    </div>
  );
}
