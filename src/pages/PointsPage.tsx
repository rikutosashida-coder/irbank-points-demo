import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronRight, FiChevronUp, FiChevronDown, FiCopy, FiCheck,
  FiUsers, FiShare2, FiTrendingUp,
  FiZap, FiLock, FiDownload, FiX,
  FiAward, FiBell, FiSettings, FiPlus, FiStar,
} from 'react-icons/fi';
import { useNotesStore } from '../features/notes/store/notesStore';
import { useTemplateStore } from '../features/notes/store/templateStore';
import { useGamificationStore, SEASONS } from '../features/gamification/store/gamificationStore';
import { TemplateGallery } from '../components/templates/TemplateGallery';
import { RankChangePopup } from '../components/RankChangePopup';
import { WelcomePopup } from '../components/WelcomePopup';
import { NoteTemplate } from '../features/notes/types/template.types';
import { AnalysisDepth } from '../features/notes/types/note.types';
import {
  TIER_CONFIG, TIER_ORDER, type TaskCategory,
} from '../features/gamification/types/gamification.types';

// ─── 役職別デスクテーマ ────────────────────
const TIER_DESK: Record<string, {
  deskImage: string;
  deskLabel: string;
  progressBar: string;
  badgeBg: string;
  settingsBtnClass: string;
  newNoteBtnClass: string;
  shareChipClass: string;
}> = {
  tier0: {
    deskImage: '/desks/desk-tier0.png',
    deskLabel: '一般社員のデスク',
    progressBar: 'bg-gradient-to-r from-slate-400 to-blue-500',
    badgeBg: 'bg-white/15 border-white/30',
    settingsBtnClass: 'bg-white/15 hover:bg-white/25 text-white border border-white/25',
    newNoteBtnClass: 'bg-white/90 text-gray-800 hover:bg-white',
    shareChipClass: 'bg-white/15 border-white/25 text-white hover:bg-white/25',
  },
  tier1: {
    deskImage: '/desks/desk-tier1.png',
    deskLabel: '係長のデスク',
    progressBar: 'bg-gradient-to-r from-blue-300 to-cyan-400',
    badgeBg: 'bg-white/10 border-white/20',
    settingsBtnClass: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    newNoteBtnClass: 'bg-white text-blue-800 hover:bg-blue-50',
    shareChipClass: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
  },
  tier2: {
    deskImage: '/desks/desk-tier2.png',
    deskLabel: '課長のデスク',
    progressBar: 'bg-gradient-to-r from-teal-300 to-emerald-400',
    badgeBg: 'bg-white/10 border-white/20',
    settingsBtnClass: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    newNoteBtnClass: 'bg-white text-teal-800 hover:bg-teal-50',
    shareChipClass: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
  },
  tier3: {
    deskImage: '/desks/desk-tier3.png',
    deskLabel: '部長のデスク',
    progressBar: 'bg-gradient-to-r from-emerald-300 to-yellow-400',
    badgeBg: 'bg-white/10 border-white/20',
    settingsBtnClass: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    newNoteBtnClass: 'bg-white text-emerald-800 hover:bg-emerald-50',
    shareChipClass: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
  },
  tier4: {
    deskImage: '/desks/desk-tier4.png',
    deskLabel: '取締役のデスク',
    progressBar: 'bg-gradient-to-r from-violet-300 to-pink-400',
    badgeBg: 'bg-white/10 border-white/20',
    settingsBtnClass: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    newNoteBtnClass: 'bg-white text-violet-800 hover:bg-violet-50',
    shareChipClass: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
  },
  tier5: {
    deskImage: '/desks/desk-tier5.png',
    deskLabel: '代表取締役社長のデスク',
    progressBar: 'bg-gradient-to-r from-yellow-300 to-amber-400',
    badgeBg: 'bg-white/10 border-white/20',
    settingsBtnClass: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    newNoteBtnClass: 'bg-white text-amber-800 hover:bg-amber-50',
    shareChipClass: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
  },
  tierX: {
    deskImage: '/desks/desk-tierX.png',
    deskLabel: '会長の間',
    progressBar: 'bg-gradient-to-r from-rose-400 via-amber-400 to-violet-400',
    badgeBg: 'bg-white/10 border-white/20',
    settingsBtnClass: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    newNoteBtnClass: 'bg-white text-rose-800 hover:bg-rose-50',
    shareChipClass: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
  },
};

// ─── お知らせモックデータ ────────────────────
interface NotificationItem {
  id: string;
  type: 'badge' | 'tier' | 'referral' | 'season' | 'system' | 'welcome';
  title: string;
  body: string;
  date: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [];

const TYPE_COLOR: Record<NotificationItem['type'], string> = {
  badge: 'bg-amber-50 border-amber-200',
  tier: 'bg-blue-50 border-blue-200',
  referral: 'bg-emerald-50 border-emerald-200',
  season: 'bg-violet-50 border-violet-200',
  system: 'bg-gray-50 border-gray-200',
  welcome: 'bg-blue-50 border-blue-200',
};

export function PointsPage() {
  const navigate = useNavigate();
  const { createNote } = useNotesStore();
  const incrementUsageCount = useTemplateStore(state => state.incrementUsageCount);
  const { profile, badges, pointHistory, tasks, referral, getUnlockedBadges, getFavoriteBadges } = useGamificationStore();

  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [pointSeasonTab, setPointSeasonTab] = useState(0); // 2026 2Q (現在のシーズン)
  const [taskStatusTab, setTaskStatusTab] = useState<'active' | 'completed' | 'upcoming'>('active');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState<'referral' | 'season' | 'total' | null>(null);
  const [previewTierIdx, setPreviewTierIdx] = useState<number | null>(null);
  const [showRankChangePopup, setShowRankChangePopup] = useState<'promotion' | 'demotion' | null>(null);

  const filteredPointHistory = useMemo(() => pointHistory.filter(p => p.season === pointSeasonTab), [pointHistory, pointSeasonTab]);
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.status === taskStatusTab);
    if (taskCategoryFilter !== 'all') filtered = filtered.filter(t => t.category === taskCategoryFilter);
    return filtered;
  }, [tasks, taskStatusTab, taskCategoryFilter]);

  const handleSelectTemplate = async (template: NoteTemplate, analysisDepth: AnalysisDepth) => {
    const isBlank = template.id === 'blank-template';
    const noteId = await createNote({
      title: isBlank ? '' : `${template.name} - ${new Date().toLocaleDateString('ja-JP')}`,
      content: [],
      freeTags: template.suggestedTags?.freeTags || [],
      ...(!isBlank && { analysisDepth }),
    });
    await incrementUsageCount(template.id);
    navigate(`/mypage/note/${noteId}`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referral.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const tierIndex = TIER_ORDER.indexOf(profile.tier);
  const currentTierConfig = TIER_CONFIG[profile.tier];
  const nextTier = tierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[tierIndex + 1] : null;
  const nextTierConfig = nextTier ? TIER_CONFIG[nextTier] : null;
  const tierProgress = nextTierConfig
    ? ((profile.badgePoints - currentTierConfig.minBadgePoints) /
       (nextTierConfig.minBadgePoints - currentTierConfig.minBadgePoints)) * 100
    : 100;

  const displayTierIdx = previewTierIdx ?? tierIndex;
  const displayTier = TIER_ORDER[displayTierIdx];
  const desk = TIER_DESK[displayTier] ?? TIER_DESK.tier0;
  const isPreviewMode = previewTierIdx !== null && previewTierIdx !== tierIndex;
  const unlockedBadges = getUnlockedBadges();
  const favoriteBadges = getFavoriteBadges();
  const currentSeason = SEASONS.find(s => s.id === pointSeasonTab);
  const unreadCount = useMemo(() => MOCK_NOTIFICATIONS.filter(n => !n.isRead).length, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-5">
      {/* ─── Welcomeメッセージボタン ─── */}
      <div className="mb-4">
        <button
          onClick={() => setShowWelcomePopup(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <FiBell className="text-lg" />
          Welcomeメッセージ
        </button>
      </div>

      {/* ─── 役職デスクヒーローカード ─── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-5 bg-gray-900"
        style={{ backgroundImage: `url(${desk.deskImage})`, backgroundSize: 'cover', backgroundPosition: 'center right' }}
      >
        {/* テキスト読みやすさ用オーバーレイ（背景も見える程度） */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/50 pointer-events-none" />

        <div className="relative p-6">

          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* 左：全情報を集約（少し中央寄せ） */}
            <div className="flex flex-col gap-4 max-w-lg lg:ml-12">
              {/* アバター＋基本情報 */}
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg bg-white/25 text-white border-2 border-white/40">
                    {profile.displayName.charAt(0)}
                  </div>
                </div>
                <div>
                  <h1 className={`text-base font-bold text-white`} style={{ textShadow: '0 2px 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8)' }}>{profile.displayName}</h1>
                </div>
              </div>

              {/* 累積ポイント */}
              <div>
                <div className={`mb-1`}>
                  <div className={`text-xs uppercase tracking-wider font-bold text-white`} style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)' }}>累計ポイント</div>
                </div>
                <div className={`flex items-baseline gap-2`}>
                  <span className={`text-6xl font-black tabular-nums leading-none text-white`} style={{ textShadow: '0 4px 16px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,0.9)' }}>
                    {profile.totalPoints.toLocaleString()}
                  </span>
                  <span className={`text-xl font-bold text-white`} style={{ textShadow: '0 2px 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8)' }}>pt</span>
                </div>
                <div className={`flex items-center gap-2 mt-2`}>
                  <span className={`text-xs text-white`} style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)' }}>今シーズン</span>
                  <span className={"text-base font-bold text-white"} style={{ textShadow: '0 2px 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8)' }}>+{profile.currentSeasonPoints.toLocaleString()} pt</span>
                  <span className={`text-xs text-white`} style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)' }}>（{SEASONS[0]?.label ?? '2026 2Q'}）</span>
                </div>
              </div>

              {/* ランキング */}
              <div>
                <div className={`text-xs mb-1 text-white`} style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)' }}>ランキング</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black text-white`} style={{ textShadow: '0 3px 12px rgba(0,0,0,1), 0 0 25px rgba(0,0,0,0.9)' }}>
                    {profile.ranking === -1 ? '-' : profile.ranking}
                  </span>
                  <span className={`text-sm text-white`} style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)' }}>位</span>
                  <span className={`text-xs text-white ml-1`} style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)' }}>/ -人</span>
                </div>
              </div>
            </div>

            {/* 右：空けておく（背景画像が見える） */}
            <div className="flex-1"></div>
          </div>

          {/* 役職進捗バー */}
          <div className="mt-5 pt-4 border-t border-white/20 max-w-lg lg:ml-12">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between text-[10px] mb-2">
                <div className={`flex items-center gap-1 text-white`} style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)' }}>
                  <FiAward className="w-3 h-3" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
                  <span>役職進捗 — 貢献度</span>
                  <span className="font-bold ml-1 text-white">
                    {profile.badgePoints}
                  </span>
                </div>
                {nextTierConfig && (
                  <span className="text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)' }}>
                    次の役職:
                    <span className="font-bold ml-1 text-white">{nextTierConfig.label}</span>
                    <span className="ml-1">（{nextTierConfig.minBadgePoints}〜）</span>
                  </span>
                )}
              </div>
              <div className="relative h-2.5 rounded-full overflow-hidden mb-2.5 bg-black/40 border border-white/30" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${desk.progressBar}`}
                  style={{ width: `${Math.min(tierProgress, 100)}%` }}
                />
              </div>
              {/* マイルストーン */}
              <div className="flex justify-between">
                {TIER_ORDER.map((t, i) => {
                  const cfg = TIER_CONFIG[t];
                  const isActive = i <= tierIndex;
                  const isCurrent = t === profile.tier;
                  return (
                    <div key={t} className="flex flex-col items-center gap-0.5" title={`${cfg.label}（貢献度 ${cfg.minBadgePoints}〜）`}>
                      <div className={`w-2 h-2 rounded-full border-2 transition-all ${
                        isCurrent
                          ? 'border-white bg-white scale-125'
                          : isActive
                            ? 'border-white/70 bg-white/50'
                            : 'border-white/40 bg-white/20'
                      }`} style={{ boxShadow: isCurrent ? '0 0 8px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.5)' }} />
                      <span className={`text-[8px] font-medium leading-tight text-center transition-all ${
                        isCurrent ? 'text-white font-bold' : isActive ? 'text-white' : 'text-white/70'
                      }`} style={{ textShadow: '0 2px 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)' }}>
                        {cfg.label === '代表取締役社長' ? '社長' : cfg.label === '会長（幻）' ? '会長' : cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── 役職バー：ラベル + 切り替えボタン ─── */}
        <div className="relative border-t border-white/20 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.8)' }}>
              {desk.deskLabel}
            </span>
            {isPreviewMode && (
              <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold shadow-md">プレビュー</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setPreviewTierIdx(Math.max(0, displayTierIdx - 1));
                setShowRankChangePopup('demotion');
              }}
              disabled={displayTierIdx === 0}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-black/40 hover:bg-black/50 text-white border border-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              title="降格（前の役職）"
            >
              <FiChevronDown className="w-3.5 h-3.5" />
              降格
            </button>
            <button
              onClick={() => {
                setPreviewTierIdx(Math.min(TIER_ORDER.length - 1, displayTierIdx + 1));
                setShowRankChangePopup('promotion');
              }}
              disabled={displayTierIdx === TIER_ORDER.length - 1}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-black/40 hover:bg-black/50 text-white border border-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              title="昇格（次の役職）"
            >
              昇格
              <FiChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── お知らせ ─── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiBell className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-bold text-gray-800">お知らせ</h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
          >
            すべて見る <FiChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_NOTIFICATIONS.length > 0 ? (
            MOCK_NOTIFICATIONS.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (n.type === 'welcome') {
                    setShowWelcomePopup(true);
                  } else {
                    navigate('/notifications');
                  }
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3"
              >
                <div className="flex-shrink-0 mt-1.5">
                  {n.isRead ? <div className="w-2 h-2 rounded-full" /> : <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold leading-tight mb-0.5 ${n.isRead ? 'text-gray-500' : 'text-gray-900'}`}>{n.title}</div>
                  <div className="text-[11px] text-gray-400 leading-snug line-clamp-1">{n.body}</div>
                </div>
                <div className="flex-shrink-0 text-[10px] text-gray-400 mt-0.5">{n.date}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">Coming Soon</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── ポイント一覧 + タスク ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

        {/* ポイント一覧 */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-gray-800">ポイント一覧</h2>
            </div>
            <div className="flex gap-1">
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPointSeasonTab(s.id)}
                  className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${
                    pointSeasonTab === s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {currentSeason && (
            <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700">{currentSeason.label}</span>
                <span className="text-[10px] text-blue-500">{currentSeason.startDate} 〜 {currentSeason.endDate}</span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-blue-700">+{filteredPointHistory.reduce((s, p) => s + p.points, 0).toLocaleString()}</span>
                <span className="text-xs text-blue-500">pt 獲得</span>
              </div>
            </div>
          )}
          <div className="max-h-[280px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-gray-400 border-b border-gray-100 sticky top-0 bg-white">
                  <th className="text-left px-4 py-1.5 font-medium">カテゴリ</th>
                  <th className="text-left px-2 py-1.5 font-medium">日付</th>
                  <th className="text-right px-4 py-1.5 font-medium">ポイント</th>
                </tr>
              </thead>
              <tbody>
                {filteredPointHistory.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">このシーズンのポイント履歴はありません</td></tr>
                ) : (
                  filteredPointHistory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        <div className="font-semibold text-gray-800">{item.category}</div>
                        <div className="text-[10px] text-gray-400">{item.description}</div>
                      </td>
                      <td className="px-2 py-2 text-gray-400 whitespace-nowrap text-[10px]">{item.date}</td>
                      <td className="px-4 py-2 text-right font-bold text-emerald-600">+{item.points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* タスク */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2.5">
              <FiZap className="w-4 h-4 text-yellow-500" />
              <h2 className="text-sm font-bold text-gray-800">タスク</h2>
            </div>
            <div className="flex gap-1 mb-2">
              {([{ key: 'active', label: '進行中' }, { key: 'completed', label: '完了' }, { key: 'upcoming', label: '今後' }] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setTaskStatusTab(key)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${taskStatusTab === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {([{ key: 'all', label: 'All' }, { key: 'daily', label: 'Daily' }, { key: 'subscription', label: 'Weekly' }, { key: 'referral', label: 'Referral' }, { key: 'season', label: 'Season' }] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setTaskCategoryFilter(key)}
                  className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${taskCategoryFilter === key ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
            {filteredTasks.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-xs">該当するタスクはありません</div>
            ) : (
              filteredTasks.map((task) => {
                const progress = Math.min((task.currentProgress / task.targetProgress) * 100, 100);
                const isDone = task.status === 'completed';
                return (
                  <div key={task.id} className={`px-4 py-3 ${isDone ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                          {isDone && <FiCheck className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</div>
                          <div className="text-[10px] text-gray-400">{task.description}</div>
                        </div>
                      </div>
                      {task.pointsReward > 0 && (
                        <div className={`flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDone ? 'bg-gray-100 text-gray-400' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                          <FiZap className="w-2.5 h-2.5" />{task.pointsReward} pt
                        </div>
                      )}
                    </div>
                    {!isDone && (
                      <div className="flex items-center gap-2 ml-6">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap font-medium">{task.currentProgress}/{task.targetProgress}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── 賞状コレクション ─── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-base">📜</span>
            <h2 className="text-sm font-bold text-gray-800">賞状コレクション</h2>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{unlockedBadges.length}/{badges.length} 取得</span>
          </div>
          <button onClick={() => navigate('/mypage/badges')} className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium">
            すべて見る <FiChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="p-4">

          {/* 授与された賞状（お気に入りのみ表示） */}
          {favoriteBadges.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                <span>✦</span> 授与された賞状 <span>✦</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteBadges.map((b) => (
                  <CertificateCard key={b.id} badge={b} locked={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── 友達紹介プログラム ─── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <FiUsers className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-gray-800">友達紹介プログラム</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center bg-blue-50 rounded-xl py-3">
              <div className="text-[10px] text-blue-500 mb-0.5">招待人数</div>
              <div className="text-2xl font-black text-blue-700">{referral.referredCount}</div>
              <div className="text-[9px] text-blue-400">人</div>
            </div>
            <div className="text-center bg-gray-50 rounded-xl py-3">
              <div className="text-[10px] text-gray-500 mb-0.5">利用可能招待</div>
              <div className="text-2xl font-black text-gray-700">{referral.availableInvites}</div>
              <div className="text-[9px] text-gray-400">枚</div>
            </div>
            <div className="text-center bg-emerald-50 rounded-xl py-3">
              <div className="text-[10px] text-emerald-600 mb-0.5">獲得ポイント</div>
              <div className="text-2xl font-black text-emerald-700">{referral.referralPoints.toLocaleString()}</div>
              <div className="text-[9px] text-emerald-500">pt</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="text-[10px] text-gray-500 mb-1.5">招待コード</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 tracking-wider">{referral.referralCode}</div>
              <button onClick={handleCopyCode} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${copiedCode ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {copiedCode ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                {copiedCode ? 'コピー済' : 'Copy'}
              </button>
            </div>
            <button onClick={() => setShowShareModal('referral')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-lg transition-colors w-full justify-center mt-2">
              <FiShare2 className="w-3.5 h-3.5" /> 招待リンクをシェア
            </button>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-gray-500 mb-2">招待コード使用履歴</div>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
              {referral.referralHistory.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">{r.userName.charAt(r.userName.length - 1)}</div>
                    <div>
                      <span className="text-xs text-gray-700 font-medium">{r.userName}</span>
                      <div className="text-[9px] text-gray-400">UID: {r.uid}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">{r.date}</span>
                    <span className="text-xs font-bold text-emerald-600">+{r.pointsEarned} pt</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${r.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.status === 'active' ? '有効' : '保留中'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 報酬 (Coming Soon) ─── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 text-center">
        <div className="text-gray-300 text-4xl mb-2">🎁</div>
        <div className="text-sm font-bold text-gray-500 mb-1">報酬</div>
        <div className="text-xs text-gray-400">Coming Soon...</div>
      </div>

      {/* テンプレートギャラリー */}
      {showTemplateGallery && (
        <TemplateGallery onSelect={handleSelectTemplate} onClose={() => setShowTemplateGallery(false)} />
      )}

      {/* ランク変更ポップアップ */}
      {showRankChangePopup && (
        <RankChangePopup type={showRankChangePopup} onClose={() => setShowRankChangePopup(null)} />
      )}

      {/* シェアモーダル */}
      {showShareModal && (
        <ShareModal
          type={showShareModal}
          profile={profile}
          referral={referral}
          unlockedBadges={unlockedBadges}
          currentSeason={SEASONS.find(s => s.id === pointSeasonTab)}
          onClose={() => setShowShareModal(null)}
        />
      )}

      {/* Welcomeポップアップ */}
      <WelcomePopup isOpen={showWelcomePopup} onClose={() => setShowWelcomePopup(false)} />
    </div>
  );
}

// ─── 賞状カード ───────────────────────────

type CertBadge = { id: string; icon: string; name: string; description: string; badgePoints: number; unlockedAt?: string | null; requirement?: string | null };

function CertificateCard({ badge: b, locked }: { badge: CertBadge; locked: boolean }) {
  // バッジポイントに基づいてランクを決定
  const getRank = (points: number): 's' | 'a' | 'b' | 'c' => {
    if (points >= 30) return 's';
    if (points >= 10) return 'a';
    if (points >= 5) return 'b';
    return 'c';
  };

  const rank = getRank(b.badgePoints);
  const certificateImage = `/certificates/certificate-rank-${rank}.png`;

  if (locked) {
    return (
      <div className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 opacity-40 hover:opacity-60 transition-all cursor-not-allowed overflow-hidden group">
        {/* 背景パターン */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '20px 20px' }} />

        {/* 内側の枠 */}
        <div className="absolute inset-2 border border-dashed border-gray-200 rounded-md pointer-events-none" />

        {/* コーナー装飾 */}
        <div className="absolute top-2 left-2 text-gray-300 text-lg leading-none">✦</div>
        <div className="absolute top-2 right-2 text-gray-300 text-lg leading-none">✦</div>
        <div className="absolute bottom-2 left-2 text-gray-300 text-lg leading-none">✦</div>
        <div className="absolute bottom-2 right-2 text-gray-300 text-lg leading-none">✦</div>

        <div className="text-center relative">
          <div className="text-[10px] font-bold text-gray-300 tracking-[0.2em] mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>表　彰　状</div>
          <div className="text-3xl grayscale opacity-20 my-3 group-hover:scale-110 transition-transform">{b.icon}</div>
          <div className="text-xs font-bold text-gray-400 mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>{b.name}</div>
          <div className="flex items-center justify-center gap-1 text-[9px] text-gray-400 mt-3 bg-gray-200/50 rounded-full px-2.5 py-1">
            <FiLock className="w-3 h-3" />
            <span>{b.requirement}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] cursor-pointer group aspect-[3/4]"
      style={{
        backgroundImage: `url(${certificateImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative px-4 py-4 h-full flex flex-col">

        {/* アイコン */}
        <div className="flex justify-center mb-3 mt-8">
          <div className="text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{b.icon}</div>
        </div>

        {/* 賞状名 */}
        <div className="text-center mb-3">
          <div className="text-base font-black text-gray-800 leading-tight" style={{ fontFamily: "'Noto Serif JP', serif", textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
            {b.name}
          </div>
        </div>

        {/* 説明文 */}
        <div className="text-[10px] text-gray-700 text-center leading-relaxed mb-auto px-1" style={{ fontFamily: "'Noto Serif JP', serif", textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>
          {b.description}
        </div>

        {/* フッター：日付 + ポイント */}
        <div className="flex items-end justify-between mt-3">
          <div className="text-[9px] text-gray-700" style={{ fontFamily: "'Noto Serif JP', serif", textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
            <div className="text-gray-600">授与日</div>
            <div className="font-bold mt-0.5">{b.unlockedAt}</div>
          </div>

          <div className="text-right bg-white/50 backdrop-blur-sm rounded-md px-2 py-1 border border-gray-300/50">
            <div className="text-[9px] font-bold text-gray-700">
              貢献度
            </div>
            <div className="text-sm font-black text-gray-800">+{b.badgePoints}</div>
          </div>
        </div>
      </div>

      {/* 底部の金色アクセント */}
      <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 shadow-inner" />

      {/* ホバー時の光エフェクト */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-400/0 via-amber-200/0 to-amber-100/0 group-hover:from-amber-400/20 group-hover:via-amber-200/10 group-hover:to-amber-100/5 transition-all duration-300 pointer-events-none rounded-lg" />
    </div>
  );
}

// ─── シェアモーダル ───────────────────────

type ShareModalProps = {
  type: 'referral' | 'season' | 'total';
  profile: { displayName: string; tier: string; totalPoints: number; currentSeasonPoints: number; badgePoints: number };
  referral: { referralCode: string; referredCount: number };
  unlockedBadges: { id: string; icon: string; name: string; badgePoints: number }[];
  currentSeason: { label: string } | undefined;
  onClose: () => void;
};

function ShareModal({ type, profile, referral, unlockedBadges, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const tierLabel = (['一般社員','係長','課長','部長','取締役','代表取締役社長','会長（幻）'] as const)[
    ['tier0','tier1','tier2','tier3','tier4','tier5','tierX'].indexOf(profile.tier)
  ] ?? profile.tier;

  const handleCopyLink = () => {
    const text = type === 'referral'
      ? `https://irbank.jp/invite?code=${referral.referralCode}`
      : type === 'total'
        ? `累計ポイント ${profile.totalPoints.toLocaleString()}pt 達成！役職「${tierLabel}」 #IRBANK`
        : `シーズンポイント ${profile.currentSeasonPoints.toLocaleString()}pt 獲得中！ #IRBANK`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleXPost = () => {
    const text = type === 'referral'
      ? `IRBANKに招待します！招待コード: ${referral.referralCode} #IRBANK`
      : type === 'total'
        ? `IRBANKで累計 ${profile.totalPoints.toLocaleString()}pt 達成しました！役職は「${tierLabel}」です 🎉 #IRBANK`
        : `IRBANKで今シーズン ${profile.currentSeasonPoints.toLocaleString()}pt 獲得しました！役職は「${tierLabel}」です 🎉 #IRBANK`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {(type === 'season' || type === 'total') && (
          <div ref={cardRef} className="bg-gradient-to-br from-blue-50 to-white p-5 border-b border-gray-100">
            <div className="text-[10px] text-gray-400 mb-1">{type === 'total' ? '累計ポイント' : 'シーズンポイント'}</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black text-gray-900 tabular-nums">
                {type === 'total' ? profile.totalPoints.toLocaleString() : profile.currentSeasonPoints.toLocaleString()}
              </span>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                profile.tier === 'tier0' ? 'bg-gray-100 text-gray-600' :
                profile.tier === 'tier1' ? 'bg-blue-100 text-blue-700' :
                profile.tier === 'tier2' ? 'bg-cyan-100 text-cyan-700' :
                profile.tier === 'tier3' ? 'bg-emerald-100 text-emerald-700' :
                profile.tier === 'tier4' ? 'bg-violet-100 text-violet-700' :
                profile.tier === 'tier5' ? 'bg-amber-100 text-amber-700' :
                'bg-rose-100 text-rose-700'
              }`}>{tierLabel}</span>
            </div>
            <div className="flex gap-2 mb-3">
              {unlockedBadges.slice(0, 4).map(b => (
                <div key={b.id} className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 border-2 border-amber-300 flex items-center justify-center text-lg shadow-sm">{b.icon}</div>
              ))}
              {unlockedBadges.length === 0 && <div className="text-xs text-gray-400">賞状なし</div>}
            </div>
            <div className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 border border-gray-200">
              <span className="text-[10px] text-gray-400">招待コード</span>
              <span className="text-xs font-mono font-bold text-gray-700">{referral.referralCode}</span>
            </div>
          </div>
        )}
        {type === 'referral' && (
          <>
            <div ref={cardRef} className="bg-gray-900 p-5">
              <div className="text-[10px] text-gray-400 mb-3 font-bold tracking-widest uppercase">IRBANK 招待</div>
              <div className="text-white font-black text-lg mb-1">{profile.displayName}</div>
              <div className="text-gray-400 text-xs mb-4">があなたをIRBANKに招待しています</div>
              <div className="bg-white rounded-xl p-3 w-24 h-24 mb-4 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-0.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.4 ? 'bg-gray-900' : 'bg-white'}`} />
                  ))}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2 mb-2">
                <div className="text-[9px] text-gray-400 mb-0.5">招待コード</div>
                <div className="text-sm font-mono font-bold text-white">{referral.referralCode}</div>
              </div>
              <div className="flex gap-2 mt-3">
                {unlockedBadges.slice(0, 3).map(b => (
                  <div key={b.id} className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5">
                    <span className="text-sm">{b.icon}</span>
                    <span className="text-[9px] text-gray-300 font-medium">{b.badgePoints}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">招待コード: <span className="font-mono font-bold text-gray-800">{referral.referralCode}</span></span>
                <span className="text-[10px] text-gray-400">{referral.referredCount}人を招待済み</span>
              </div>
            </div>
          </>
        )}
        <div className="flex items-center justify-around px-4 py-4">
          <button className="flex flex-col items-center gap-1.5 group">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <FiDownload className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-[10px] text-gray-500">画像保存</span>
          </button>
          <button onClick={handleCopyLink} className="flex flex-col items-center gap-1.5 group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${copied ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
              {copied ? <FiCheck className="w-4 h-4 text-emerald-600" /> : <FiCopy className="w-4 h-4 text-gray-600" />}
            </div>
            <span className="text-[10px] text-gray-500">{copied ? 'コピー済' : 'コピー'}</span>
          </button>
          <button onClick={handleXPost} className="flex flex-col items-center gap-1.5 group">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black transition-colors">
              <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span className="text-[10px] text-gray-500">X投稿</span>
          </button>
          <button onClick={onClose} className="flex flex-col items-center gap-1.5 group">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <FiX className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-[10px] text-gray-500">閉じる</span>
          </button>
        </div>
      </div>
    </div>
  );
}
