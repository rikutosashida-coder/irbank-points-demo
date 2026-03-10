import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { StockReview, Sentiment, StockReviewReply } from '../types/community.types';

// ─── モックデータ ───────────────────────────────────

function generateMockReviews(stockCode: string): StockReview[] {
  const mockData: Record<string, StockReview[]> = {
    '7203': [
      {
        id: 'r1',
        stockCode: '7203',
        authorName: 'バリュー投資家K',
        authorTier: 'gold',
        sentiment: 'bullish',
        title: 'EV戦略が本格化、長期保有に自信',
        body: '全固体電池の量産計画が具体化してきた。マルチパスウェイ戦略は他社にない強み。PBR1倍割れは明らかに割安。配当利回りも3%超で、下値は限定的と見ている。',
        likes: 24,
        isLiked: false,
        replies: [
          {
            id: 'rp1',
            authorName: '成長株ハンター',
            authorTier: 'silver',
            body: '同感です。ただしEVシフトのスピードが遅いリスクもあるので、そこは注視してます。',
            likes: 8,
            isLiked: false,
            createdAt: '2026-02-15T14:30:00',
          },
        ],
        createdAt: '2026-02-15T10:00:00',
      },
      {
        id: 'r2',
        stockCode: '7203',
        authorName: 'テクニカル分析派M',
        authorTier: 'platinum',
        sentiment: 'neutral',
        title: '短期はレンジ相場、方向感待ち',
        body: '日足では25日線と75日線の間でもみ合い中。出来高も減少傾向で、決算発表まではトレンドが出にくい環境。次の決算がカタリストになるか注目。',
        likes: 15,
        isLiked: false,
        replies: [],
        createdAt: '2026-02-14T16:20:00',
      },
      {
        id: 'r3',
        stockCode: '7203',
        authorName: 'リスク管理重視の投資家',
        authorTier: 'silver',
        sentiment: 'bearish',
        title: '為替リスクが過小評価されている',
        body: '円高トレンドが続けば、輸出比率の高いトヨタは大きな影響を受ける。現在の株価はドル円145円前提だが、130円台に戻る可能性も考慮すべき。',
        likes: 11,
        isLiked: false,
        replies: [
          {
            id: 'rp2',
            authorName: 'バリュー投資家K',
            authorTier: 'gold',
            body: '為替ヘッジのポジションもかなり厚いので、短期的な影響は限定的では？',
            likes: 5,
            isLiked: false,
            createdAt: '2026-02-13T20:00:00',
          },
          {
            id: 'rp3',
            authorName: 'マクロウォッチャー',
            authorTier: 'bronze',
            body: '日銀の利上げペース次第ですね。春先に向けて円高圧力が強まる可能性は高いと思います。',
            likes: 3,
            isLiked: false,
            createdAt: '2026-02-14T08:15:00',
          },
        ],
        createdAt: '2026-02-13T15:45:00',
      },
    ],
  };

  if (mockData[stockCode]) return mockData[stockCode];

  // デフォルトのモックデータ
  return [
    {
      id: `def-r1-${stockCode}`,
      stockCode,
      authorName: '個人投資家A',
      authorTier: 'silver',
      sentiment: 'bullish',
      title: '業績好調、来期も期待できる',
      body: '直近の決算は市場予想を上回る内容。営業利益率の改善が顕著で、来期の成長余地は大きいと見ている。',
      likes: 7,
      isLiked: false,
      replies: [
        {
          id: `def-rp1-${stockCode}`,
          authorName: '慎重派トレーダー',
          authorTier: 'bronze',
          body: 'セクター全体の地合いも良いですよね。ただしバリュエーションには注意が必要かも。',
          likes: 2,
          isLiked: false,
          createdAt: '2026-02-14T11:00:00',
        },
      ],
      createdAt: '2026-02-14T09:30:00',
    },
    {
      id: `def-r2-${stockCode}`,
      stockCode,
      authorName: 'ファンダ重視のY',
      authorTier: 'gold',
      sentiment: 'neutral',
      title: '適正株価付近、急いで買う必要はない',
      body: 'PER・PBRともにセクター平均程度。特段の割安感はないが、割高でもない。カタリストを待ちたい局面。',
      likes: 5,
      isLiked: false,
      replies: [],
      createdAt: '2026-02-13T18:00:00',
    },
  ];
}

// ─── Store ───────────────────────────────────────

interface CommunityStore {
  reviewsByStock: Record<string, StockReview[]>;

  getReviews: (stockCode: string) => StockReview[];
  addReview: (stockCode: string, review: { title: string; body: string; sentiment: Sentiment }) => void;
  addReply: (stockCode: string, reviewId: string, body: string) => void;
  toggleLikeReview: (stockCode: string, reviewId: string) => void;
  toggleLikeReply: (stockCode: string, reviewId: string, replyId: string) => void;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  reviewsByStock: {},

  getReviews: (stockCode: string) => {
    const state = get();
    if (!state.reviewsByStock[stockCode]) {
      const mock = generateMockReviews(stockCode);
      set((s) => ({
        reviewsByStock: { ...s.reviewsByStock, [stockCode]: mock },
      }));
      return mock;
    }
    return state.reviewsByStock[stockCode];
  },

  addReview: (stockCode, { title, body, sentiment }) => {
    const newReview: StockReview = {
      id: uuidv4(),
      stockCode,
      authorName: '投資家ユーザー',
      authorTier: 'gold',
      sentiment,
      title,
      body,
      likes: 0,
      isLiked: false,
      replies: [],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      reviewsByStock: {
        ...s.reviewsByStock,
        [stockCode]: [newReview, ...(s.reviewsByStock[stockCode] || [])],
      },
    }));
  },

  addReply: (stockCode, reviewId, body) => {
    const reply: StockReviewReply = {
      id: uuidv4(),
      authorName: '投資家ユーザー',
      authorTier: 'gold',
      body,
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      reviewsByStock: {
        ...s.reviewsByStock,
        [stockCode]: (s.reviewsByStock[stockCode] || []).map((r) =>
          r.id === reviewId ? { ...r, replies: [...r.replies, reply] } : r,
        ),
      },
    }));
  },

  toggleLikeReview: (stockCode, reviewId) => {
    set((s) => ({
      reviewsByStock: {
        ...s.reviewsByStock,
        [stockCode]: (s.reviewsByStock[stockCode] || []).map((r) =>
          r.id === reviewId
            ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
            : r,
        ),
      },
    }));
  },

  toggleLikeReply: (stockCode, reviewId, replyId) => {
    set((s) => ({
      reviewsByStock: {
        ...s.reviewsByStock,
        [stockCode]: (s.reviewsByStock[stockCode] || []).map((r) =>
          r.id === reviewId
            ? {
                ...r,
                replies: r.replies.map((rp) =>
                  rp.id === replyId
                    ? { ...rp, isLiked: !rp.isLiked, likes: rp.isLiked ? rp.likes - 1 : rp.likes + 1 }
                    : rp,
                ),
              }
            : r,
        ),
      },
    }));
  },
}));
