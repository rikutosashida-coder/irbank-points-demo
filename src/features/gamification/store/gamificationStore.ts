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
    description: 'IRBANKのWaiting Listに登録した創業メンバーへ贈られる賞状',
    category: 'participation',
    badgePoints: 10,
    icon: '🏛️',
    unlockedAt: '2026-07-01',
    requirement: 'Waiting Listに登録する',
    distributionLimit: null,
  },
  {
    id: 'b2',
    name: '広報活動貢献賞',
    description: '公式SNSを3つ以上フォローし、IRBANKの広報に貢献した証',
    category: 'pr',
    badgePoints: 3,
    icon: '📢',
    unlockedAt: null, // 未獲得に変更
    requirement: '公式SNSを3つ以上フォロー',
    distributionLimit: null,
  },
  {
    id: 'b3',
    name: '仲間創出功労賞',
    description: '5人の仲間をIRBANKに招待した功績を称える賞状',
    category: 'referral',
    badgePoints: 5,
    icon: '🤝',
    unlockedAt: null, // 未獲得に変更
    requirement: '5人を招待する',
    distributionLimit: null,
  },
  {
    id: 'b4',
    name: '組織拡大貢献賞',
    description: '10人の仲間をIRBANKに招待し、組織拡大に貢献した証',
    category: 'referral',
    badgePoints: 10,
    icon: '🌱',
    unlockedAt: null, // 未獲得
    requirement: '10人を招待する',
    distributionLimit: null,
  },
  {
    id: 'b5',
    name: '組織成長表彰状',
    description: '30人の仲間をIRBANKに招待し、組織の成長に大きく貢献した証',
    category: 'referral',
    badgePoints: 30,
    icon: '🏆',
    unlockedAt: null, // 未獲得
    requirement: '30人を招待する',
    distributionLimit: null,
  },
  {
    id: 'b6',
    name: '初期参画貢献賞',
    description: 'Betaセカンドフェーズ（10〜12月）に参加した先駆者への賞状',
    category: 'season',
    badgePoints: 5,
    icon: '⭐',
    unlockedAt: null, // 未獲得（10月以降に解放）
    requirement: 'Beta版セカンドフェーズ（10〜12月）に参加',
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
  // 2026 1Q
  { id: 'p1', category: 'ログイン', description: 'デイリーログインボーナス', points: 1, date: '2026-02-16', season: 1 },
  { id: 'p2', category: '友人招待', description: 'ユーザーC を招待（チュートリアル完了）', points: 25, date: '2026-02-13', season: 1 },
  { id: 'p3', category: 'ログイン', description: 'デイリーログインボーナス', points: 1, date: '2026-02-12', season: 1 },
  { id: 'p4', category: 'ログイン継続', description: '月20日ログイン達成ボーナス', points: 10, date: '2026-02-10', season: 1 },
  { id: 'p5', category: '友人招待', description: 'ユーザーB を招待（チュートリアル完了）', points: 25, date: '2026-01-28', season: 1 },
  { id: 'p6', category: 'ログイン', description: 'デイリーログインボーナス', points: 1, date: '2026-01-25', season: 1 },
  { id: 'p7', category: 'Discord参加', description: 'Discordコミュニティ参加', points: 10, date: '2026-01-20', season: 1 },
  { id: 'p8', category: 'X連携', description: 'Xアカウント連携', points: 10, date: '2026-01-15', season: 1 },
  { id: 'p9', category: 'X公式フォロー', description: 'IRBANK公式Xフォロー', points: 10, date: '2026-01-15', season: 1 },
  { id: 'p10', category: '情報修正報告', description: '企業情報の誤りを報告', points: 10, date: '2026-01-12', season: 1 },
  // 2025 4Q（前シーズン）
  { id: 'p11', category: 'WL登録', description: 'Waiting List登録ボーナス（特別付与分）', points: 280, date: '2025-10-15', season: 0 },
  { id: 'p12', category: 'WL登録', description: 'Waiting List登録（即時分）', points: 20, date: '2025-10-15', season: 0 },
  { id: 'p13', category: '友人招待', description: 'ユーザーA を招待（チュートリアル完了）', points: 25, date: '2025-11-10', season: 0 },
  { id: 'p14', category: 'X指定アカウントフォロー', description: '指定Xアカウントをフォロー', points: 3, date: '2025-11-05', season: 0 },
];

const MOCK_TASKS: GamificationTask[] = [
  // デイリータスク
  { id: 't1', title: '今日もログインする', description: 'ログインするだけで1pt！毎日続けよう', category: 'daily', status: 'completed', currentProgress: 1, targetProgress: 1, pointsReward: 1 },
  { id: 't2', title: 'Xをシェアする', description: 'IRBANKを拡散してポイント獲得（任意）', category: 'daily', status: 'active', currentProgress: 0, targetProgress: 1, pointsReward: 3 },
  // 継続タスク
  { id: 't3', title: '今月20日ログイン', description: '1ヶ月に20日ログインで継続ボーナス', category: 'subscription', status: 'active', currentProgress: 12, targetProgress: 20, pointsReward: 10 },
  { id: 't4', title: 'Discord参加＆認証', description: 'Discordコミュニティに参加して認証を完了', category: 'subscription', status: 'completed', currentProgress: 1, targetProgress: 1, pointsReward: 10 },
  // リファラルタスク
  { id: 't5', title: '5人の仲間を招待する', description: '招待コードで5人を招待して賞状を獲得！', category: 'referral', status: 'active', currentProgress: 3, targetProgress: 5, pointsReward: 5 },
  { id: 't6', title: '10人の仲間を招待する', description: '招待コードで10人を招待して上位賞状を獲得！', category: 'referral', status: 'active', currentProgress: 3, targetProgress: 10, pointsReward: 10 },
  // シーズンタスク
  { id: 't7', title: '2026 1Q 課長に昇格', description: 'バッジポイント15ptを集めて課長になろう', category: 'season', status: 'completed', currentProgress: 18, targetProgress: 15, pointsReward: 0 },
  { id: 't8', title: '2026 1Q 部長を目指せ！', description: 'バッジポイント30ptを集めて部長に昇格', category: 'season', status: 'active', currentProgress: 18, targetProgress: 30, pointsReward: 0 },
];

const MOCK_REFERRAL: ReferralStats = {
  referredCount: 3,
  availableInvites: 8, // 群A: 10件発行、3件使用済み
  referralPoints: 75,
  referralCode: 'IRBANK-ALPHA-X7K2',
  referralHistory: [
    { id: 'r1', uid: 'UID-00123', userName: 'ユーザーA', date: '2025-11-10', pointsEarned: 25, status: 'active' },
    { id: 'r2', uid: 'UID-00247', userName: 'ユーザーB', date: '2026-01-28', pointsEarned: 25, status: 'active' },
    { id: 'r3', uid: 'UID-00391', userName: 'ユーザーC', date: '2026-02-13', pointsEarned: 25, status: 'active' },
  ],
};

// ─── シーズン定義 ─────────────────────────────────────

export const SEASONS = [
  { id: 0, year: 2025, quarter: '4Q' as const, label: '2025 4Q', startDate: '2025-10-01', endDate: '2025-12-31' },
  { id: 1, year: 2026, quarter: '1Q' as const, label: '2026 1Q', startDate: '2026-01-01', endDate: '2026-03-31' },
  { id: 2, year: 2026, quarter: '2Q' as const, label: '2026 2Q', startDate: '2026-04-01', endDate: '2026-06-30' },
];

// ─── Store ───────────────────────────────────────

interface GamificationStore {
  profile: UserProfile;
  badges: Badge[];
  pointHistory: PointHistoryItem[];
  tasks: GamificationTask[];
  referral: ReferralStats;
  isLoaded: boolean;

  loadGamificationData: () => Promise<void>;
  getPointHistoryBySeason: (season: number) => PointHistoryItem[];
  getTasksByStatus: (status: 'active' | 'completed' | 'upcoming') => GamificationTask[];
  getTasksByCategory: (category: string) => GamificationTask[];
  getUnlockedBadges: () => Badge[];
  getLockedBadges: () => Badge[];
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  profile: MOCK_PROFILE,
  badges: MOCK_BADGES,
  pointHistory: MOCK_POINT_HISTORY,
  tasks: MOCK_TASKS,
  referral: MOCK_REFERRAL,
  isLoaded: false,

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
}));
