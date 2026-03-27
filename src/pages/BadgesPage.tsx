import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiStar } from 'react-icons/fi';
import { useGamificationStore } from '../features/gamification/store/gamificationStore';

export function BadgesPage() {
  const navigate = useNavigate();
  const { badges, getUnlockedBadges, getLockedBadges, favoriteBadgeIds, toggleFavoriteBadge } = useGamificationStore();

  const unlockedBadges = getUnlockedBadges();
  const lockedBadges = getLockedBadges();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">戻る</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <h1 className="text-lg font-bold text-gray-800">賞状コレクション</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {unlockedBadges.length}/{badges.length} 取得
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 取得済み賞状 */}
        {unlockedBadges.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-bold text-amber-700 uppercase tracking-wider">✦ 授与された賞状</span>
              <span className="text-xs text-gray-500">({unlockedBadges.length}枚)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {unlockedBadges.map((badge) => (
                <CertificateCard
                  key={badge.id}
                  badge={badge}
                  locked={false}
                  isFavorite={favoriteBadgeIds.includes(badge.id)}
                  onToggleFavorite={() => toggleFavoriteBadge(badge.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 未取得賞状 */}
        {lockedBadges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiLock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">未授与の賞状</span>
              <span className="text-xs text-gray-400">({lockedBadges.length}枚)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lockedBadges.map((badge) => (
                <CertificateCard key={badge.id} badge={badge} locked={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 賞状カード ───────────────────────────
type CertBadge = {
  id: string;
  icon: string;
  name: string;
  description: string;
  badgePoints: number;
  unlockedAt?: string | null;
  requirement?: string | null;
};

function CertificateCard({
  badge: b,
  locked,
  isFavorite = false,
  onToggleFavorite,
}: {
  badge: CertBadge;
  locked: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
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
      <div
        className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group aspect-[3/4]"
        style={{
          backgroundImage: 'url(/certificates/certificate-locked.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative h-full flex flex-col justify-end p-4">
          {/* 達成条件 */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-700 bg-white/90 rounded-lg px-3 py-2 border border-gray-300 shadow-sm">
            <FiLock className="w-3.5 h-3.5" />
            <span className="font-medium">{b.requirement}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] group aspect-[3/4]"
      style={{
        backgroundImage: `url(${certificateImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* お気に入りボタン */}
      {!locked && onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? 'bg-amber-400 text-white shadow-lg scale-110'
              : 'bg-white/80 text-gray-400 hover:bg-white hover:text-amber-400'
          }`}
        >
          <FiStar className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      )}
    </div>
  );
}
