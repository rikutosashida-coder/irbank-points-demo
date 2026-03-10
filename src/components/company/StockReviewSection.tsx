import { useState, useMemo } from 'react';
import { FiMessageCircle, FiThumbsUp, FiCornerDownRight, FiSend, FiTrendingUp, FiTrendingDown, FiMinus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useCommunityStore } from '../../features/community/store/communityStore';
import type { Sentiment, StockReview } from '../../features/community/types/community.types';

interface StockReviewSectionProps {
  stockCode: string;
}

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; color: string; bg: string; icon: typeof FiTrendingUp }> = {
  bullish: { label: '強気', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: FiTrendingUp },
  bearish: { label: '弱気', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: FiTrendingDown },
  neutral: { label: '中立', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: FiMinus },
};

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  bronze: { label: 'B', cls: 'bg-amber-100 text-amber-700' },
  silver: { label: 'S', cls: 'bg-gray-200 text-gray-600' },
  gold: { label: 'G', cls: 'bg-yellow-100 text-yellow-700' },
  platinum: { label: 'P', cls: 'bg-purple-100 text-purple-700' },
};

type FilterType = 'all' | 'bullish' | 'bearish' | 'neutral';

export function StockReviewSection({ stockCode }: StockReviewSectionProps) {
  const { getReviews, addReview, addReply, toggleLikeReview, toggleLikeReply } = useCommunityStore();
  const reviews = getReviews(stockCode);

  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formSentiment, setFormSentiment] = useState<Sentiment>('neutral');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const filteredReviews = useMemo(() => {
    if (filter === 'all') return reviews;
    return reviews.filter((r) => r.sentiment === filter);
  }, [reviews, filter]);

  const sentimentCounts = useMemo(() => {
    const counts = { bullish: 0, bearish: 0, neutral: 0 };
    for (const r of reviews) counts[r.sentiment]++;
    return counts;
  }, [reviews]);

  const handleSubmitReview = () => {
    if (!formTitle.trim() || !formBody.trim()) return;
    addReview(stockCode, { title: formTitle.trim(), body: formBody.trim(), sentiment: formSentiment });
    setFormTitle('');
    setFormBody('');
    setFormSentiment('neutral');
    setShowForm(false);
  };

  const handleSubmitReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    addReply(stockCode, reviewId, replyText.trim());
    setReplyText('');
    setReplyingTo(null);
  };

  const toggleReplies = (reviewId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return '数分前';
    if (hours < 24) return `${hours}時間前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}日前`;
    return d.toLocaleDateString('ja-JP');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <FiMessageCircle className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-800">口コミ・投資家の声</h3>
          <span className="text-[10px] text-gray-400">{reviews.length}件</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiSend className="w-3 h-3" />
          投稿する
        </button>
      </div>

      {/* 投稿フォーム */}
      {showForm && (
        <div className="px-5 py-4 border-b border-gray-100 bg-blue-50/30">
          <div className="mb-3">
            <div className="text-[10px] text-gray-500 mb-1.5">投資スタンス</div>
            <div className="flex gap-2">
              {(['bullish', 'bearish', 'neutral'] as Sentiment[]).map((s) => {
                const cfg = SENTIMENT_CONFIG[s];
                const Icon = cfg.icon;
                return (
                  <button
                    key={s}
                    onClick={() => setFormSentiment(s)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      formSentiment === s ? cfg.bg + ' ' + cfg.color : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="タイトル（例: 決算が好調、長期保有に自信）"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <textarea
            value={formBody}
            onChange={(e) => setFormBody(e.target.value)}
            placeholder="あなたの見解を投稿してください..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={!formTitle.trim() || !formBody.trim()}
              className="px-4 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              投稿する
            </button>
          </div>
        </div>
      )}

      {/* センチメントサマリー + フィルター */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SentimentBar bullish={sentimentCounts.bullish} neutral={sentimentCounts.neutral} bearish={sentimentCounts.bearish} />
        </div>
        <div className="flex gap-1">
          {([
            { key: 'all', label: 'すべて' },
            { key: 'bullish', label: '強気' },
            { key: 'neutral', label: '中立' },
            { key: 'bearish', label: '弱気' },
          ] as { key: FilterType; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${
                filter === key ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 口コミリスト */}
      <div className="divide-y divide-gray-50">
        {filteredReviews.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-xs">
            口コミはまだありません。最初の投稿をしてみましょう。
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              stockCode={stockCode}
              replyingTo={replyingTo}
              replyText={replyText}
              expandedReplies={expandedReplies}
              onToggleReplies={toggleReplies}
              onReply={(id) => { setReplyingTo(id); setReplyText(''); }}
              onCancelReply={() => setReplyingTo(null)}
              onReplyTextChange={setReplyText}
              onSubmitReply={handleSubmitReply}
              onToggleLike={toggleLikeReview}
              onToggleLikeReply={toggleLikeReply}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── センチメントバー ────────────────────────

function SentimentBar({ bullish, neutral, bearish }: { bullish: number; neutral: number; bearish: number }) {
  const total = bullish + neutral + bearish;
  if (total === 0) return null;
  const bp = (bullish / total) * 100;
  const np = (neutral / total) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-32 rounded-full overflow-hidden">
        <div className="bg-green-500" style={{ width: `${bp}%` }} />
        <div className="bg-gray-300" style={{ width: `${np}%` }} />
        <div className="bg-red-500" style={{ width: `${100 - bp - np}%` }} />
      </div>
      <div className="flex items-center gap-2 text-[10px]">
        <span className="text-green-600 font-medium">強気 {bullish}</span>
        <span className="text-gray-400 font-medium">中立 {neutral}</span>
        <span className="text-red-600 font-medium">弱気 {bearish}</span>
      </div>
    </div>
  );
}

// ─── 口コミカード ────────────────────────

function ReviewCard({
  review,
  stockCode,
  replyingTo,
  replyText,
  expandedReplies,
  onToggleReplies,
  onReply,
  onCancelReply,
  onReplyTextChange,
  onSubmitReply,
  onToggleLike,
  onToggleLikeReply,
  formatDate,
}: {
  review: StockReview;
  stockCode: string;
  replyingTo: string | null;
  replyText: string;
  expandedReplies: Set<string>;
  onToggleReplies: (id: string) => void;
  onReply: (id: string) => void;
  onCancelReply: () => void;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: (reviewId: string) => void;
  onToggleLike: (stockCode: string, reviewId: string) => void;
  onToggleLikeReply: (stockCode: string, reviewId: string, replyId: string) => void;
  formatDate: (iso: string) => string;
}) {
  const sentimentCfg = SENTIMENT_CONFIG[review.sentiment];
  const SentIcon = sentimentCfg.icon;
  const tierBadge = TIER_BADGE[review.authorTier];
  const showReplies = expandedReplies.has(review.id);

  return (
    <div className="px-5 py-4">
      {/* 著者情報 + センチメント */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
            {review.authorName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-800">{review.authorName}</span>
              <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${tierBadge.cls}`}>
                {tierBadge.label}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${sentimentCfg.bg} ${sentimentCfg.color}`}>
          <SentIcon className="w-3 h-3" />
          {sentimentCfg.label}
        </div>
      </div>

      {/* タイトル + 本文 */}
      <h4 className="text-sm font-bold text-gray-900 mb-1">{review.title}</h4>
      <p className="text-xs text-gray-600 leading-relaxed mb-3">{review.body}</p>

      {/* アクション */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggleLike(stockCode, review.id)}
          className={`flex items-center gap-1 text-[10px] transition-colors ${
            review.isLiked ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FiThumbsUp className="w-3 h-3" />
          {review.likes}
        </button>
        <button
          onClick={() => onReply(review.id)}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiCornerDownRight className="w-3 h-3" />
          返信
        </button>
        {review.replies.length > 0 && (
          <button
            onClick={() => onToggleReplies(review.id)}
            className="flex items-center gap-0.5 text-[10px] text-blue-500 hover:text-blue-700 transition-colors"
          >
            {showReplies ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
            返信 {review.replies.length}件
          </button>
        )}
      </div>

      {/* 返信フォーム */}
      {replyingTo === review.id && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmitReply(review.id)}
            placeholder="返信を入力..."
            className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoFocus
          />
          <button
            onClick={() => onSubmitReply(review.id)}
            disabled={!replyText.trim()}
            className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors"
          >
            送信
          </button>
          <button
            onClick={onCancelReply}
            className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            取消
          </button>
        </div>
      )}

      {/* 返信一覧 */}
      {showReplies && review.replies.length > 0 && (
        <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-100 space-y-3">
          {review.replies.map((rp) => {
            const rpBadge = TIER_BADGE[rp.authorTier];
            return (
              <div key={rp.id}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400">
                    {rp.authorName.charAt(0)}
                  </div>
                  <span className="text-[11px] font-medium text-gray-700">{rp.authorName}</span>
                  <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${rpBadge.cls}`}>{rpBadge.label}</span>
                  <span className="text-[10px] text-gray-400">{formatDate(rp.createdAt)}</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-1">{rp.body}</p>
                <button
                  onClick={() => onToggleLikeReply(stockCode, review.id, rp.id)}
                  className={`flex items-center gap-1 text-[10px] transition-colors ${
                    rp.isLiked ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FiThumbsUp className="w-2.5 h-2.5" />
                  {rp.likes}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
