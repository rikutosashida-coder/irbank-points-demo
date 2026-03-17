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
      <div className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-all overflow-hidden group aspect-[3/4]">
        {/* 背景パターン */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* 内側の枠 */}
        <div className="absolute inset-2 border border-dashed border-gray-200 rounded-md pointer-events-none" />

        {/* コーナー装飾 */}
        <div className="absolute top-2 left-2 text-gray-300 text-lg leading-none">✦</div>
        <div className="absolute top-2 right-2 text-gray-300 text-lg leading-none">✦</div>
        <div className="absolute bottom-2 left-2 text-gray-300 text-lg leading-none">✦</div>
        <div className="absolute bottom-2 right-2 text-gray-300 text-lg leading-none">✦</div>

        <div className="text-center relative h-full flex flex-col justify-center">
          {/* ？マーク */}
          <div className="text-6xl text-gray-400 my-4 font-bold">？</div>

          {/* 賞状名を隠す */}
          <div className="text-lg font-bold text-gray-400 mb-4 tracking-wider" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            ？？？
          </div>

          {/* 達成条件のみ表示 */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 mt-3 bg-white/70 rounded-lg px-3 py-2 border border-gray-300">
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
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? 'bg-amber-400 text-white shadow-lg scale-110'
              : 'bg-white/80 text-gray-400 hover:bg-white hover:text-amber-400'
          }`}
        >
          <FiStar className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      )}

      <div className="relative px-4 py-6 h-full flex flex-col">
        {/* アイコン */}
        <div className="flex justify-center mb-3 mt-8">
          <div className="text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
            {b.icon}
          </div>
        </div>

        {/* 賞状名 */}
        <div className="text-center mb-3">
          <div
            className="text-base font-black text-gray-800 leading-tight"
            style={{ fontFamily: "'Noto Serif JP', serif", textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}
          >
            {b.name}
          </div>
        </div>

        {/* 説明文 */}
        <div
          className="text-[10px] text-gray-700 text-center leading-relaxed mb-auto px-1"
          style={{ fontFamily: "'Noto Serif JP', serif", textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}
        >
          {b.description}
        </div>

        {/* フッター：日付 + ポイント */}
        <div className="flex items-end justify-between mt-3">
          <div
            className="text-[9px] text-gray-700"
            style={{ fontFamily: "'Noto Serif JP', serif", textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
          >
            <div className="text-gray-600">授与日</div>
            <div className="font-bold mt-0.5">{b.unlockedAt}</div>
          </div>

          <div className="text-right bg-white/50 backdrop-blur-sm rounded-md px-2 py-1 border border-gray-300/50">
            <div className="text-[9px] font-bold text-gray-700">貢献度</div>
            <div className="text-sm font-black text-gray-800">+{b.badgePoints}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
