import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiRefreshCw, FiInfo } from 'react-icons/fi';
import { DecisionType, DECISION_TYPE_LABELS, AnalysisSnapshot } from '../../features/notes/types/investment.types';
import { useInvestmentDecisionStore } from '../../features/notes/store/investmentDecisionStore';
import { useNotesStore } from '../../features/notes/store/notesStore';
import { getStockPrice } from '../../services/api/irbankApi';
import { Note } from '../../features/notes/types/note.types';

interface InvestmentDecisionFormProps {
  noteId: string;
  onClose: () => void;
  editingDecisionId?: string;
}

export function InvestmentDecisionForm({ noteId, onClose, editingDecisionId }: InvestmentDecisionFormProps) {
  const addDecision = useInvestmentDecisionStore((state) => state.addDecision);
  const updateDecision = useInvestmentDecisionStore((state) => state.updateDecision);
  const getNoteById = useNotesStore((state) => state.getNoteById);
  const getDecisionsByNoteId = useInvestmentDecisionStore((state) => state.getDecisionsByNoteId);

  const note = getNoteById(noteId);
  const analysisItems = note?.analysisItems || [];
  const stockCode = note?.anchorTags.find(tag => tag.stockCode)?.stockCode;

  // 編集中の決定を取得
  const editingDecision = editingDecisionId
    ? getDecisionsByNoteId(noteId).find(d => d.id === editingDecisionId)
    : undefined;

  const [decisionType, setDecisionType] = useState<DecisionType>(editingDecision?.decisionType || 'buy');
  const [decisionDate, setDecisionDate] = useState(
    editingDecision?.decisionDate
      ? new Date(editingDecision.decisionDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [reason, setReason] = useState(editingDecision?.reason || '');

  // 取引詳細
  const [executeDate, setExecuteDate] = useState(
    editingDecision?.tradeDetails?.executeDate
      ? new Date(editingDecision.tradeDetails.executeDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [pricePerShare, setPricePerShare] = useState(
    editingDecision?.tradeDetails?.pricePerShare?.toString() || ''
  );
  const [shares, setShares] = useState(
    editingDecision?.tradeDetails?.shares?.toString() || ''
  );
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  // 関連分析項目
  const [selectedAnalysisItemIds, setSelectedAnalysisItemIds] = useState<string[]>(
    editingDecision?.relatedAnalysisItemIds || []
  );

  // 分析スナップショットを生成
  const buildAnalysisSnapshot = (targetNote: Note): AnalysisSnapshot => {
    const stockTag = targetNote.anchorTags.find(t => t.stockCode);
    const ratedItems = targetNote.analysisItems.filter(item => item.rating && item.rating > 0);
    const totalWeight = ratedItems.reduce((sum, item) => sum + (item.weight || 5), 0);
    const weightedSum = ratedItems.reduce((sum, item) => sum + (item.rating || 0) * (item.weight || 5), 0);

    return {
      noteTitle: targetNote.title,
      noteSummary: targetNote.summary,
      analysisDate: targetNote.updatedAt,
      stockCode: stockTag?.stockCode,
      stockName: stockTag?.stockName,
      analysisItemRatings: targetNote.analysisItems.map(item => ({
        title: item.title,
        rating: item.rating,
        weight: item.weight,
      })),
      overallScore: totalWeight > 0 ? weightedSum / totalWeight : undefined,
      keywords: targetNote.keywords,
    };
  };

  const showTradeDetails = decisionType === 'buy' || decisionType === 'sell';
  const totalAmount = showTradeDetails && pricePerShare && shares
    ? parseFloat(pricePerShare) * parseInt(shares, 10)
    : 0;

  // 実行日が変更されたら株価を自動取得
  useEffect(() => {
    if (!showTradeDetails || !executeDate || !stockCode) return;

    const fetchPrice = async () => {
      setIsFetchingPrice(true);
      try {
        const price = await getStockPrice(stockCode, new Date(executeDate));
        if (price !== null) {
          setPricePerShare(price.toString());
        }
      } catch (error) {
        console.error('株価取得エラー:', error);
      } finally {
        setIsFetchingPrice(false);
      }
    };

    fetchPrice();
  }, [executeDate, showTradeDetails, stockCode]);

  // 株価を手動で再取得
  const handleRefreshPrice = async () => {
    if (!stockCode || !executeDate) return;

    setIsFetchingPrice(true);
    try {
      const price = await getStockPrice(stockCode, new Date(executeDate));
      if (price !== null) {
        setPricePerShare(price.toString());
      }
    } catch (error) {
      console.error('株価取得エラー:', error);
      alert('株価の取得に失敗しました。');
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // スナップショットは新規作成時のみ自動キャプチャ（編集時は既存を保持）
    const snapshot = !editingDecisionId && note
      ? buildAnalysisSnapshot(note)
      : editingDecision?.analysisSnapshot;

    const decisionData = {
      noteId,
      decisionType,
      decisionDate: new Date(decisionDate),
      reason: reason.trim() || undefined,
      tradeDetails: showTradeDetails && pricePerShare && shares
        ? {
            executeDate: new Date(executeDate),
            pricePerShare: parseFloat(pricePerShare),
            shares: parseInt(shares, 10),
            totalAmount,
          }
        : undefined,
      relatedAnalysisItemIds: selectedAnalysisItemIds.length > 0 ? selectedAnalysisItemIds : undefined,
      analysisSnapshot: snapshot,
    };

    try {
      if (editingDecisionId) {
        // 編集モード
        await updateDecision(editingDecisionId, decisionData);
      } else {
        // 新規作成モード
        await addDecision(decisionData);
      }
      onClose();
    } catch (error) {
      console.error('投資判断の保存に失敗しました:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  const toggleAnalysisItem = (itemId: string) => {
    setSelectedAnalysisItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingDecisionId ? '投資判断を編集' : '投資判断を記録'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="閉じる"
        >
          <FiX className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 判断種別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            判断種別
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(DECISION_TYPE_LABELS) as DecisionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDecisionType(type)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                  decisionType === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {DECISION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* 判断日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            判断日
          </label>
          <input
            type="date"
            value={decisionDate}
            onChange={(e) => setDecisionDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 判断理由 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            判断理由（任意）
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="例: ROEが15%超で割安、成長性も高い"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            maxLength={500}
          />
          <p className="mt-1 text-xs text-gray-500">{reason.length}/500文字</p>
        </div>

        {/* 関連する分析項目 */}
        {analysisItems.length > 0 && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">
              関連する分析項目（任意）
            </h4>
            <p className="text-xs text-gray-500">
              この投資判断に関連する分析項目を選択してください
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {analysisItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAnalysisItemIds.includes(item.id)}
                    onChange={() => toggleAnalysisItem(item.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{item.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 分析スナップショット（由来情報）プレビュー */}
        {!editingDecisionId && note && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <FiInfo className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-semibold text-gray-700">記録される分析由来情報</h4>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">分析ノート</span>
                <span className="text-sm font-medium text-gray-900">{note.title}</span>
              </div>
              {note.anchorTags.find(t => t.stockCode) && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">銘柄</span>
                  <span className="text-sm text-gray-800">
                    {note.anchorTags.find(t => t.stockCode)?.stockName || note.anchorTags.find(t => t.stockCode)?.stockCode}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">分析時点</span>
                <span className="text-sm text-gray-800">
                  {new Date(note.updatedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {note.analysisItems.filter(i => i.rating && i.rating > 0).length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">評価項目</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.analysisItems
                      .filter(i => i.rating && i.rating > 0)
                      .map(item => (
                        <span key={item.id} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white rounded border border-blue-200">
                          {item.title}
                          <span className="text-yellow-600 font-semibold">{item.rating}★</span>
                        </span>
                      ))
                    }
                  </div>
                </div>
              )}
              {note.summary && (
                <div>
                  <span className="text-xs text-gray-500">要約</span>
                  <p className="text-xs text-gray-700 mt-0.5 line-clamp-2">{note.summary}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              判断時点の分析状態が自動的に記録されます
            </p>
          </div>
        )}

        {/* 取引詳細（買い/売りのみ） */}
        {showTradeDetails && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">
              {decisionType === 'buy' ? '購入' : '売却'}詳細
            </h4>

            {/* 実行日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {decisionType === 'buy' ? '購入日' : '売却日'}
              </label>
              <input
                type="date"
                value={executeDate}
                onChange={(e) => setExecuteDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={showTradeDetails}
              />
            </div>

            {/* 株価 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  1株あたり価格（円）
                </label>
                {stockCode && (
                  <button
                    type="button"
                    onClick={handleRefreshPrice}
                    disabled={isFetchingPrice}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                    title="株価を再取得"
                  >
                    <FiRefreshCw className={`w-3 h-3 ${isFetchingPrice ? 'animate-spin' : ''}`} />
                    {isFetchingPrice ? '取得中...' : 'IRBANKから取得'}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={pricePerShare}
                  onChange={(e) => setPricePerShare(e.target.value)}
                  placeholder="例: 1500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required={showTradeDetails}
                  disabled={isFetchingPrice}
                />
                {isFetchingPrice && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {!stockCode && showTradeDetails && (
                <p className="mt-1 text-xs text-amber-600">
                  ※ アンカータグに銘柄を登録すると、株価を自動取得できます
                </p>
              )}
              {stockCode && (
                <p className="mt-1 text-xs text-gray-500">
                  銘柄コード: {stockCode} の{new Date(executeDate).toLocaleDateString('ja-JP')}の終値
                </p>
              )}
            </div>

            {/* 株数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                株数
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="例: 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                step="1"
                required={showTradeDetails}
              />
            </div>

            {/* 総額（自動計算） */}
            {pricePerShare && shares && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">総額</span>
                  <span className="text-lg font-bold text-blue-900">
                    {totalAmount.toLocaleString()}円
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiCheck className="w-4 h-4" />
            記録する
          </button>
        </div>
      </form>
    </div>
  );
}
