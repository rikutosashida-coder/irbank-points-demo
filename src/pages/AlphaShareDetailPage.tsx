import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiStar, FiShoppingCart, FiTrendingUp, FiCopy, FiCheck, FiArrowLeft,
  FiUser, FiCalendar, FiDownload, FiShield, FiRefreshCw, FiAward,
  FiShare2, FiHeart, FiPlay, FiCode, FiActivity, FiCpu, FiUsers,
  FiDollarSign, FiZap, FiBarChart2, FiX,
} from 'react-icons/fi';

// 商品データ（モック）
const PRODUCT = {
  id: 'p1',
  title: '決算短信を15秒で要約するAIエージェント',
  description: 'IRBANK APIと連携し、開示直後の決算短信を自動で要点抽出。投資判断を即座にサポートします。',
  longDescription: `決算発表直後の市場の動きについていけない、PDFを開いて読む時間がもったいない —— そんな悩みを解決します。

このAIエージェントは、IRBANK APIから自動で最新の決算短信を取得し、以下の項目を15秒以内に要約します：

✅ 売上・営業利益・経常利益・純利益のYoY/QoQ変化率
✅ 通期予想に対する進捗率
✅ セグメント別業績の特徴
✅ サプライズ（市場予想との乖離）の有無
✅ 経営者コメントから読み取れる戦略変更点
✅ 注目すべき注記事項（特別損失、子会社化など）

【動作環境】
- Claude Pro / Team / Enterprise
- ChatGPT Plus 以上
- IRBANK API契約（別途必要）

【サポート対象】
- 東証Prime/Standard/Growth全銘柄
- 米国主要500銘柄

【アップデート】
月1回の機能更新を保証。新機能追加時はメール通知。`,
  category: 'agent',
  price: 1500,
  isMonthly: true,
  creator: '投資アナリストK',
  creatorAvatar: 'K',
  creatorBio: '元証券会社アナリスト10年。現在は個人投資家向けAIツール開発に従事。',
  creatorFollowers: 1240,
  creatorProducts: 8,
  rating: 4.8,
  reviewCount: 234,
  purchaseCount: 1820,
  weeklyChange: 28.5,
  badges: ['🔥 急上昇', '⭐ TOP10'],
  affiliateRate: 50,
  thumbnail: '📊',
  releaseDate: '2026-01-15',
  lastUpdated: '2026-04-10',
  version: 'v2.3.1',
};

const REVIEWS = [
  { user: '投資家A', avatar: 'A', rating: 5, date: '3日前', comment: '決算シーズンの効率が劇的に上がりました。IRBANKと組み合わせれば最強のツールです。', verified: true },
  { user: 'クオンツ志望', avatar: 'C', rating: 5, date: '1週間前', comment: '従来手動で30分かかっていた作業が文字通り15秒で終わります。投資判断のスピードが段違い。', verified: true },
  { user: 'デイトレーダー', avatar: 'D', rating: 4, date: '2週間前', comment: '速度は申し分ない。たまに細かい数字の取り違えがあるので★4。アップデートに期待。', verified: true },
  { user: 'バリュー投資家', avatar: 'V', rating: 5, date: '3週間前', comment: 'バリュー投資メインだが、四半期決算のチェック効率が10倍に。月1500円の価値は十分ある。', verified: false },
];

const RELATED = [
  { id: 'p2', title: 'バフェット流バリュー投資スクリーニング', price: 980, thumbnail: '💎', rating: 4.6 },
  { id: 'p3', title: '日経225オプション 自動アラートBot', price: 4980, thumbnail: '⚡', rating: 4.9 },
  { id: 'p8', title: 'AI銘柄スコアリングモデル', price: 9800, thumbnail: '🧮', rating: 4.9 },
];

export function AlphaShareDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'description' | 'reviews' | 'creator' | 'changelog'>('description');
  const [showAffiliate, setShowAffiliate] = useState(false);
  const [copied, setCopied] = useState(false);

  const affiliateLink = `https://alphashare.irbank.net/p/${id}?ref=user_xxxxx`;
  const userMonthlyEarnings = Math.round(PRODUCT.price * (PRODUCT.affiliateRate / 100));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/alphashare')} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-4 h-4" /> AlphaShare
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">AIエージェント</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ─── 左カラム（メインコンテンツ） ─── */}
        <div className="lg:col-span-2">
          {/* 商品ヘッダー */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {PRODUCT.badges?.map(b => (
                <span key={b} className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{b}</span>
              ))}
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">AIエージェント</span>
            </div>

            <div className="flex items-start gap-5 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl flex-shrink-0">
                {PRODUCT.thumbnail}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">{PRODUCT.title}</h1>
                <p className="text-gray-600">{PRODUCT.description}</p>
              </div>
            </div>

            {/* メトリクス */}
            <div className="grid grid-cols-4 gap-4 pt-5 border-t border-gray-100">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-1">
                  <FiStar className="w-4 h-4 fill-current" />
                  <span className="font-black text-lg">{PRODUCT.rating}</span>
                </div>
                <div className="text-xs text-gray-400">{PRODUCT.reviewCount}件のレビュー</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-gray-700 mb-1">
                  <FiShoppingCart className="w-4 h-4" />
                  <span className="font-black text-lg">{PRODUCT.purchaseCount.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400">累計購入数</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-green-600 mb-1">
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="font-black text-lg">+{PRODUCT.weeklyChange}%</span>
                </div>
                <div className="text-xs text-gray-400">週間販売増</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-purple-600 mb-1">
                  <FiUsers className="w-4 h-4" />
                  <span className="font-black text-lg">{PRODUCT.creatorFollowers.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400">クリエイターフォロワー</div>
              </div>
            </div>
          </div>

          {/* タブ */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex border-b border-gray-200">
              {[
                { key: 'description', label: '商品詳細' },
                { key: 'reviews', label: `レビュー (${PRODUCT.reviewCount})` },
                { key: 'creator', label: 'クリエイター' },
                { key: 'changelog', label: 'アップデート履歴' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as any)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-6">
              {tab === 'description' && (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">{PRODUCT.longDescription}</pre>
                </div>
              )}
              {tab === 'reviews' && (
                <div className="space-y-5">
                  {/* レビュー集計 */}
                  <div className="flex items-center gap-6 pb-5 border-b border-gray-100">
                    <div className="text-center">
                      <div className="text-5xl font-black text-gray-900">{PRODUCT.rating}</div>
                      <div className="flex items-center gap-0.5 text-amber-500 my-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`w-4 h-4 ${i < Math.floor(PRODUCT.rating) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <div className="text-xs text-gray-400">{PRODUCT.reviewCount}件</div>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map(stars => {
                        const pct = stars === 5 ? 78 : stars === 4 ? 15 : stars === 3 ? 5 : stars === 2 ? 1 : 1;
                        return (
                          <div key={stars} className="flex items-center gap-2 text-xs">
                            <span className="w-6 text-gray-500">{stars}★</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-right text-gray-400">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* レビュー一覧 */}
                  {REVIEWS.map((r, i) => (
                    <div key={i} className="border-b border-gray-100 pb-5 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {r.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-sm">{r.user}</span>
                            {r.verified && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200">✓ 購入確認済</span>}
                            <span className="text-xs text-gray-400">{r.date}</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-500 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : ''}`} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700">{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'creator' && (
                <div>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl flex-shrink-0">
                      {PRODUCT.creatorAvatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900">{PRODUCT.creator}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span><strong className="text-gray-900">{PRODUCT.creatorFollowers.toLocaleString()}</strong> フォロワー</span>
                        <span><strong className="text-gray-900">{PRODUCT.creatorProducts}</strong> 出品中</span>
                        <span className="flex items-center gap-1 text-amber-500"><FiStar className="w-3.5 h-3.5 fill-current" /> 4.8</span>
                      </div>
                      <button className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                        フォローする
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{PRODUCT.creatorBio}</p>
                </div>
              )}
              {tab === 'changelog' && (
                <div className="space-y-4 text-sm">
                  {[
                    { v: 'v2.3.1', date: '2026-04-10', changes: ['セグメント別業績の精度向上', 'バグ修正：稀に数値が取れない不具合'] },
                    { v: 'v2.3.0', date: '2026-03-15', changes: ['米国株対応開始', '英語決算短信の要約機能追加'] },
                    { v: 'v2.2.0', date: '2026-02-01', changes: ['市場予想との乖離検出機能を追加'] },
                    { v: 'v2.0.0', date: '2026-01-15', changes: ['初回リリース'] },
                  ].map(c => (
                    <div key={c.v} className="border-l-2 border-blue-300 pl-4">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-gray-900">{c.v}</span>
                        <span className="text-xs text-gray-400">{c.date}</span>
                      </div>
                      <ul className="mt-1 text-gray-600 list-disc list-inside">
                        {c.changes.map((ch, i) => <li key={i}>{ch}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 関連商品 */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">関連するAI資産</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {RELATED.map(p => (
                <div key={p.id} onClick={() => navigate(`/alphashare/product/${p.id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">{p.thumbnail}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{p.title}</h3>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-amber-500 flex items-center gap-0.5"><FiStar className="w-3 h-3 fill-current" /> {p.rating}</span>
                        <span className="font-bold text-gray-900">¥{p.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 右カラム（購入パネル） ─── */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">

            {/* 購入カード */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                <div className="text-3xl font-black text-gray-900">
                  ¥{PRODUCT.price.toLocaleString()}
                  {PRODUCT.isMonthly && <span className="text-base font-normal text-gray-400 ml-1">/月</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {PRODUCT.isMonthly ? '初月無料・いつでもキャンセル可能' : '買い切り・永続利用'}
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors mb-2">
                購入する
              </button>
              <button className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <FiHeart /> ウィッシュリスト
              </button>

              {/* 補足情報 */}
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-2"><FiShield className="w-3.5 h-3.5 text-green-500" /> 30日間返金保証</div>
                <div className="flex items-center gap-2"><FiRefreshCw className="w-3.5 h-3.5 text-blue-500" /> 定期アップデート保証</div>
                <div className="flex items-center gap-2"><FiAward className="w-3.5 h-3.5 text-amber-500" /> AlphaShare 認証クリエイター</div>
                <div className="flex items-center gap-2"><FiCalendar className="w-3.5 h-3.5 text-gray-400" /> 最終更新: {PRODUCT.lastUpdated} ({PRODUCT.version})</div>
              </div>
            </div>

            {/* アフィリエイトカード（目玉機能） */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-gray-900">アフィリエイト機能</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                購入後、あなたのリンク経由で誰かが買うと、<br />
                <strong className="text-amber-700 text-base">1件あたり ¥{userMonthlyEarnings.toLocaleString()}{PRODUCT.isMonthly && '/月'}</strong> が報酬として入ります。
              </p>

              <div className="bg-white rounded-lg p-3 mb-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">想定収益シミュレーション</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-gray-500">5人紹介</div>
                    <div className="text-base font-black text-amber-700">¥{(userMonthlyEarnings * 5).toLocaleString()}</div>
                  </div>
                  <div className="border-x border-gray-100">
                    <div className="text-xs text-gray-500">20人紹介</div>
                    <div className="text-base font-black text-amber-700">¥{(userMonthlyEarnings * 20).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">100人紹介</div>
                    <div className="text-base font-black text-amber-700">¥{(userMonthlyEarnings * 100).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowAffiliate(true)}
                className="w-full py-2.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2">
                <FiShare2 /> アフィリエイトリンクを発行
              </button>
              <div className="text-[10px] text-gray-500 text-center mt-2">
                ※ 購入後すぐに発行可能（報酬率 {PRODUCT.affiliateRate}%）
              </div>
            </div>

            {/* クリエイター */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">{PRODUCT.creatorAvatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm">{PRODUCT.creator}</div>
                  <div className="text-xs text-gray-500">{PRODUCT.creatorFollowers.toLocaleString()}フォロワー</div>
                </div>
                <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">フォロー</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* アフィリエイトモーダル */}
      {showAffiliate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAffiliate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">アフィリエイトリンク</h2>
              <button onClick={() => setShowAffiliate(false)} className="p-1 hover:bg-gray-100 rounded"><FiX /></button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="text-xs text-amber-700 font-bold mb-1">あなたの報酬率</div>
              <div className="text-3xl font-black text-amber-700">{PRODUCT.affiliateRate}%</div>
              <div className="text-xs text-amber-600 mt-1">1件あたり ¥{userMonthlyEarnings.toLocaleString()}{PRODUCT.isMonthly && '/月'}</div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">あなたのアフィリエイトリンク</label>
              <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <code className="text-xs text-gray-700 flex-1 truncate">{affiliateLink}</code>
                <button onClick={() => { navigator.clipboard.writeText(affiliateLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 flex items-center gap-1">
                  {copied ? <><FiCheck /> コピー済</> : <><FiCopy /> コピー</>}
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-4">
              ※ このリンクから購入が発生すると、あなたに報酬が支払われます。<br />
              ※ 報酬は月末締め・翌月末払いです。
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['X', 'LINE', 'Email'].map(s => (
                <button key={s} className="py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50">
                  {s}でシェア
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
