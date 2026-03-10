export type DecisionType = 'buy' | 'sell' | 'hold' | 'watch' | 'pass';

export interface TradeDetails {
  executeDate: Date;
  pricePerShare: number;
  shares: number;
  totalAmount: number;
}

// 判断時点の分析スナップショット（由来情報）
export interface AnalysisSnapshot {
  noteTitle: string;
  noteSummary?: string;
  analysisDate: Date; // 分析を実施した日時（＝ノートの最終更新日）
  stockCode?: string;
  stockName?: string;
  // 判断時点の各分析項目の評価
  analysisItemRatings: {
    title: string;
    rating?: number;
    weight?: number;
  }[];
  overallScore?: number; // 加重平均スコア
  keywords?: string[];
}

export interface InvestmentDecision {
  id: string;
  noteId: string;
  decisionType: DecisionType;
  decisionDate: Date;
  reason?: string;

  // 取引詳細（買い/売りの場合）
  tradeDetails?: TradeDetails;

  // 関連する分析項目
  relatedAnalysisItemIds?: string[];

  // 判断時点の分析スナップショット（由来情報）
  analysisSnapshot?: AnalysisSnapshot;

  createdAt: Date;
  updatedAt: Date;
}

export const DECISION_TYPE_LABELS: Record<DecisionType, string> = {
  buy: '買い',
  sell: '売り',
  hold: '保有継続',
  watch: '様子見',
  pass: '見送り',
};

export const DECISION_TYPE_COLORS: Record<DecisionType, string> = {
  buy: 'bg-green-100 text-green-700 border-green-300',
  sell: 'bg-red-100 text-red-700 border-red-300',
  hold: 'bg-blue-100 text-blue-700 border-blue-300',
  watch: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  pass: 'bg-gray-100 text-gray-700 border-gray-300',
};
