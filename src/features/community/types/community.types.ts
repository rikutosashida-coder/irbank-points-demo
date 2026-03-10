export type Sentiment = 'bullish' | 'bearish' | 'neutral';

export interface StockReview {
  id: string;
  stockCode: string;
  authorName: string;
  authorTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  sentiment: Sentiment;
  title: string;
  body: string;
  likes: number;
  isLiked: boolean;
  replies: StockReviewReply[];
  createdAt: string;
}

export interface StockReviewReply {
  id: string;
  authorName: string;
  authorTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  body: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}
