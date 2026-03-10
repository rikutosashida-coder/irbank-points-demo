// ─── Tier（役職）定義 ───────────────────────────────────────────────────────
// Tierはバッジポイント合計によって決定（通常ポイントとは独立）

export type TierLevel =
  | 'tier0'   // 一般社員
  | 'tier1'   // 係長
  | 'tier2'   // 課長
  | 'tier3'   // 部長
  | 'tier4'   // 取締役
  | 'tier5'   // 代表取締役社長
  | 'tierX';  // 会長（幻）

export interface TierConfig {
  label: string;
  minBadgePoints: number;
  maxBadgePoints: number | null; // nullは上限なし
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  gift: string | null;
  description: string;
}

export const TIER_CONFIG: Record<TierLevel, TierConfig> = {
  tier0: {
    label: '一般社員',
    minBadgePoints: 0,
    maxBadgePoints: 5,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-600',
    gift: null,
    description: 'IRBANKコミュニティへようこそ',
  },
  tier1: {
    label: '係長',
    minBadgePoints: 5,
    maxBadgePoints: 15,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-600',
    gift: null,
    description: 'コミュニティへの貢献が認められました',
  },
  tier2: {
    label: '課長',
    minBadgePoints: 15,
    maxBadgePoints: 30,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-700',
    gift: null,
    description: '積極的な活動を評価します',
  },
  tier3: {
    label: '部長',
    minBadgePoints: 30,
    maxBadgePoints: 60,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    gift: 'IRBANK無料チケット',
    description: 'コミュニティを牽引するリーダー',
  },
  tier4: {
    label: '取締役',
    minBadgePoints: 60,
    maxBadgePoints: 120,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    textColor: 'text-violet-700',
    gift: 'IRBANK公式グッズ',
    description: '経営幹部として会社を支えるメンバー',
  },
  tier5: {
    label: '代表取締役社長',
    minBadgePoints: 120,
    maxBadgePoints: 240,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-700',
    gift: '???',
    description: 'IRBANKの顔として輝くトップメンバー',
  },
  tierX: {
    label: '会長（幻）',
    minBadgePoints: 240,
    maxBadgePoints: null,
    color: 'text-rose-700',
    bgColor: 'bg-gradient-to-r from-amber-50 to-rose-50',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-700',
    gift: 'IRBANK招待',
    description: '伝説の存在。代表取締役社長を5シーズン維持した猛者',
  },
};

export const TIER_ORDER: TierLevel[] = ['tier0', 'tier1', 'tier2', 'tier3', 'tier4', 'tier5', 'tierX'];

// Tierにバッジポイントから判定する関数
export function getTierFromBadgePoints(badgePoints: number): TierLevel {
  if (badgePoints >= 240) return 'tierX';
  if (badgePoints >= 120) return 'tier5';
  if (badgePoints >= 60) return 'tier4';
  if (badgePoints >= 30) return 'tier3';
  if (badgePoints >= 15) return 'tier2';
  if (badgePoints >= 5) return 'tier1';
  return 'tier0';
}

// ─── シーズン定義（四半期制） ───────────────────────────────────────────────

export type SeasonQuarter = '1Q' | '2Q' | '3Q' | '4Q';

export interface Season {
  id: number;
  year: number;
  quarter: SeasonQuarter;
  label: string; // 例: "2026 1Q"
  startDate: string;
  endDate: string;
}

// ─── ユーザープロフィール ───────────────────────────────────────────────────

export interface UserProfile {
  displayName: string;
  tier: TierLevel;
  totalPoints: number;          // 通常ポイント合計（行動で獲得）
  currentSeasonPoints: number;  // 今シーズンの通常ポイント
  badgePoints: number;          // バッジポイント合計（Tier判定に使用）
  currentSeasonBadgePoints: number; // 今シーズンのバッジポイント
  ranking: number;
  totalUsers: number;
  joinedAt: string;
  consecutiveTopSeasons: number; // 代表取締役社長を継続したシーズン数（会長条件用）
}

// ─── 通常ポイント履歴 ───────────────────────────────────────────────────────

export interface PointHistoryItem {
  id: string;
  category: string;
  description: string;
  points: number;
  date: string;
  season: number;
}

// ─── 賞状（バッジ）定義 ─────────────────────────────────────────────────────
// コンセプト：「社長から賞状をもらう」感覚

export type BadgeCategory = 'participation' | 'pr' | 'referral' | 'season' | 'special';

export interface Badge {
  id: string;
  name: string;           // 例: 創業参加功労賞
  description: string;
  category: BadgeCategory;
  badgePoints: number;    // このバッジが持つバッジポイント（Tier判定に使用）
  icon: string;           // 絵文字アイコン
  unlockedAt: string | null; // nullは未獲得
  // 獲得条件
  requirement: string;
  // 配布制限
  distributionLimit: number | null; // nullは制限なし
}

// ─── タスク定義 ─────────────────────────────────────────────────────────────

export type TaskCategory = 'daily' | 'subscription' | 'referral' | 'season';
export type TaskStatus = 'active' | 'completed' | 'upcoming';

export interface GamificationTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  currentProgress: number;
  targetProgress: number;
  pointsReward: number;
  expiresAt?: string;
}

// ─── 招待（リファラル）定義 ─────────────────────────────────────────────────

export interface ReferralStats {
  referredCount: number;
  availableInvites: number;
  referralPoints: number;
  referralCode: string;
  referralHistory: ReferralHistoryItem[];
}

export interface ReferralHistoryItem {
  id: string;
  uid: string;       // UID（仕様書4.1準拠）
  userName: string;
  date: string;
  pointsEarned: number;
  status: 'active' | 'pending'; // active=25pt有効化済み, pending=チュートリアル未完了
}
