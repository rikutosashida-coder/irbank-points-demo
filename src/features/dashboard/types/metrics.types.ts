export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface KeywordFrequency {
  keyword: string;
  count: number;
  sentiment: Sentiment;
}

export interface DataPoint {
  date: Date;
  value: number;
}

export interface DecisionAccuracy {
  total: number;
  correct: number;
  wrong: number;
  pending: number;
}

export interface InvestorMetrics {
  userId: string;
  periodStart: Date;
  periodEnd: Date;

  // 活動メトリクス
  notesCreated: number;
  decisionsRecorded: number;
  reviewsCompleted: number;

  // 判断メトリクス
  decisionAccuracy: DecisionAccuracy;

  // 思考パターン
  commonKeywords: KeywordFrequency[];
  commonRisks: string[];
  favoriteIndustries: string[];

  // 成長指標
  analysisDepthTrend: DataPoint[]; // 分析の深さの推移
  decisionSpeedTrend: DataPoint[]; // 判断までの速度
  reviewFrequency: number; // 振り返り頻度
}
