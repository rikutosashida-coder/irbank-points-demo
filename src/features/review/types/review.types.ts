export type ReviewType = 'manual' | 'scheduled' | 'ai_prompted';
export type HypothesisAccuracy = 'correct' | 'partially_correct' | 'wrong' | 'too_early';

export interface Review {
  id: string;
  noteId: string;
  reviewDate: Date;
  reviewType: ReviewType;

  // 振り返り内容
  whatChanged: string; // 何が変わったか
  whyChanged: string; // なぜ変わったか
  newInsights: string; // 新しい気づき
  actionItems: string[]; // 次のアクション

  // 投資判断との紐付け
  relatedDecisionIds?: string[];

  // 結果
  hypothesisAccuracy?: HypothesisAccuracy;
  lessonsLearned?: string;

  createdAt: Date;
}
