import { create } from 'zustand';
import type {
  UserProfile,
  PointHistoryItem,
  Badge,
  GamificationTask,
  ReferralStats,
} from '../types/gamification.types';
import { getTierFromBadgePoints } from '../types/gamification.types';

// ─── モックデータ ───────────────────────────────────

const MOCK_BADGES: Badge[] = [
  {
    id: 'b1',
    name: '創業参加功労賞',
    description: 'クラウドファンディングに参加したメンバー（ランクS）',
    category: 'participation',
    badgePoints: 10,
    icon: '🏛️',
    unlockedAt: '2026-04-15',
    requirement: 'クラウドファンディングに参加する',
    distributionLimit: null,
  },
  {
    id: 'b2',
    name: '広報活動貢献賞',
    description: '公式SNSを3つ以上フォロー（ランクC）',
    category: 'pr',
    badgePoints: 3,
    icon: '📢',
    unlockedAt: null,
    requirement: '公式SNSを3つ以上フォロー',
    distributionLimit: null,
  },
  {
    id: 'b3',
    name: '仲間創出功労賞',
    description: '5人招待（ランクB）',
    category: 'referral',
    badgePoints: 5,
    icon: '🤝',
    unlockedAt: null,
    requirement: '5人を招待する',
    distributionLimit: null,
  },
  {
    id: 'b4',
    name: '組織拡大貢献賞',
    description: '10人招待（ランクA）',
    category: 'referral',
    badgePoints: 10,
    icon: '🌱',
    unlockedAt: null,
    requirement: '10人を招待する',
    distributionLimit: null,
  },
  {
    id: 'b5',
    name: '組織成長表彰状',
    description: '30人招待（ランクS）',
    category: 'referral',
    badgePoints: 30,
    icon: '🏆',
    unlockedAt: null,
    requirement: '30人を招待する',
    distributionLimit: null,
  },
  {
    id: 'b6',
    name: '初期参画貢献賞',
    description: 'β版セカンドフェーズに登録したメンバー（ランクA）',
    category: 'season',
    badgePoints: 5,
    icon: '⭐',
    unlockedAt: null,
    requirement: 'β版セカンドフェーズに参加',
    distributionLimit: null,
  },
];

// バッジポイント合計を計算
const totalBadgePoints = MOCK_BADGES
  .filter(b => b.unlockedAt !== null)
  .reduce((sum, b) => sum + b.badgePoints, 0);
// 解除済み: b1(10) = 10pt → 一般社員

const MOCK_PROFILE: UserProfile = {
  displayName: 'ユーザー名',
  tier: getTierFromBadgePoints(totalBadgePoints),
  totalPoints: 300,       // 通常ポイント（行動累計）
  currentSeasonPoints: 300, // 今シーズン(2026 2Q)
  badgePoints: totalBadgePoints, // 10pt
  currentSeasonBadgePoints: 10,
  ranking: -1, // ランキング外（-位）
  totalUsers: 5555,
  joinedAt: '2026-07-01',
  consecutiveTopSeasons: 0,
};

const MOCK_POINT_HISTORY: PointHistoryItem[] = [
  // 2026 2Q（現在のシーズン）
  { id: 'p1', category: 'クラウドファンディング参加（特別ボーナス）', description: 'クラウドファンディング参加特別ボーナス', points: 280, date: '2026-04-15', season: 0 },
  { id: 'p2', category: 'β版参加（特別ボーナス）', description: 'β版参加特別ボーナス', points: 20, date: '2026-04-15', season: 0 },
];

const MOCK_TASKS: GamificationTask[] = [
  // 完了済みタスク
  { id: 't1', title: 'クラウドファンディングに参加', description: 'IRBANKのクラウドファンディングに参加して創業メンバーになる', category: 'subscription', status: 'completed', currentProgress: 1, targetProgress: 1, pointsReward: 280 },
  { id: 't2', title: 'β版参加登録', description: 'IRBANK β版の参加登録を完了する', category: 'subscription', status: 'completed', currentProgress: 1, targetProgress: 1, pointsReward: 20 },

  // Coming Soon タスク - 基本
  { id: 't3', title: '今日もログインする', description: 'ログインするだけで0.2pt！毎日続けよう', category: 'daily', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 0.2 },
  { id: 't4', title: '今月20日ログイン', description: '1ヶ月に20日ログインで継続ボーナス', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 20, pointsReward: 10 },

  // Coming Soon タスク - X関連
  { id: 't5', title: 'X連携', description: 'Xアカウントを連携する', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 10 },
  { id: 't6', title: 'X公式アカウントフォロー', description: 'IRBANK公式Xアカウントをフォローする', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 10 },
  { id: 't7', title: '指田悠馬-株式会社IRBANK CEO-をフォロー', description: 'X指定アカウントをフォローする', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 3 },
  { id: 't8', title: '『ぽん』-IRBANK公式広報-をフォロー', description: 'X指定アカウントをフォローする', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 3 },
  { id: 't9', title: '適時開示速報-IRBANKをフォロー', description: 'X指定アカウントをフォローする', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 3 },
  { id: 't10', title: '適時開示速報(決算短信)-IRBANKをフォロー', description: 'X指定アカウントをフォローする', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 3 },
  { id: 't11', title: '臨時報告書-IRBANKをフォロー', description: 'X指定アカウントをフォローする', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 3 },
  { id: 't12', title: '自己株買付情報-IRBANKをフォロー', description: 'X指定アカウントをフォローする', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 3 },
  { id: 't13', title: '有価証券報告書-IRBANKをフォロー', description: 'X指定アカウントをフォローする', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 3 },
  { id: 't14', title: '大量保有報告書-IRBANKをフォロー', description: 'X指定アカウントをフォローする', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 3 },

  // Coming Soon タスク - その他
  { id: 't15', title: 'YouTubeチャンネル登録', description: 'IRBANK公式YouTubeチャンネルに登録する', category: 'subscription', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 10 },
  { id: 't16', title: 'ユーザー招待', description: '招待コードで仲間を招待する（1人ごとに25pt）', category: 'referral', status: 'upcoming', currentProgress: 0, targetProgress: 1, pointsReward: 25 },
];

const MOCK_REFERRAL: ReferralStats = {
  referredCount: 0,
  availableInvites: 10,
  referralPoints: 0,
  referralCode: 'Coming Soon',
  referralHistory: [],
};

// ─── シーズン定義 ─────────────────────────────────────

export const SEASONS = [
  { id: 0, year: 2026, quarter: '2Q' as const, label: '2026 2Q', startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 1, year: 2026, quarter: '3Q' as const, label: '2026 3Q', startDate: '2026-07-01', endDate: '2026-09-30' },
  { id: 2, year: 2026, quarter: '4Q' as const, label: '2026 4Q', startDate: '2026-10-01', endDate: '2026-12-31' },
];

// ─── Store ───────────────────────────────────────

interface GamificationStore {
  profile: UserProfile;
  badges: Badge[];
  pointHistory: PointHistoryItem[];
  tasks: GamificationTask[];
  referral: ReferralStats;
  isLoaded: boolean;
  favoriteBadgeIds: string[];

  loadGamificationData: () => Promise<void>;
  getPointHistoryBySeason: (season: number) => PointHistoryItem[];
  getTasksByStatus: (status: 'active' | 'completed' | 'upcoming') => GamificationTask[];
  getTasksByCategory: (category: string) => GamificationTask[];
  getUnlockedBadges: () => Badge[];
  getLockedBadges: () => Badge[];
  getFavoriteBadges: () => Badge[];
  toggleFavoriteBadge: (badgeId: string) => void;
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  profile: MOCK_PROFILE,
  badges: MOCK_BADGES,
  pointHistory: MOCK_POINT_HISTORY,
  tasks: MOCK_TASKS,
  referral: MOCK_REFERRAL,
  isLoaded: false,
  favoriteBadgeIds: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('favoriteBadgeIds') || '[]')
    : [],

  loadGamificationData: async () => {
    set({ isLoaded: true });
  },

  getPointHistoryBySeason: (season: number) => {
    return get().pointHistory.filter((p) => p.season === season);
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status);
  },

  getTasksByCategory: (category) => {
    if (category === 'all') return get().tasks;
    return get().tasks.filter((t) => t.category === category);
  },

  getUnlockedBadges: () => {
    return get().badges.filter((b) => b.unlockedAt !== null);
  },

  getLockedBadges: () => {
    return get().badges.filter((b) => b.unlockedAt === null);
  },

  getFavoriteBadges: () => {
    const { badges, favoriteBadgeIds } = get();
    const unlockedBadges = badges.filter((b) => b.unlockedAt !== null);

    // お気に入りが設定されていない場合、最初に獲得した3枚を自動表示
    if (favoriteBadgeIds.length === 0) {
      return unlockedBadges.slice(0, 3);
    }

    return badges.filter((b) => favoriteBadgeIds.includes(b.id) && b.unlockedAt !== null);
  },

  toggleFavoriteBadge: (badgeId: string) => {
    const { favoriteBadgeIds } = get();
    let newFavorites: string[];

    if (favoriteBadgeIds.includes(badgeId)) {
      // 既にお気に入りなら削除
      newFavorites = favoriteBadgeIds.filter((id) => id !== badgeId);
    } else {
      // お気に入りに追加（最大3枚まで）
      if (favoriteBadgeIds.length >= 3) {
        alert('お気に入りは最大3枚までです');
        return;
      }
      newFavorites = [...favoriteBadgeIds, badgeId];
    }

    set({ favoriteBadgeIds: newFavorites });
    localStorage.setItem('favoriteBadgeIds', JSON.stringify(newFavorites));
  },
}));
