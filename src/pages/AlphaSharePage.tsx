import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp, FiTrendingDown, FiSearch, FiStar, FiUsers, FiAward, FiZap,
  FiCpu, FiDatabase, FiCode, FiImage, FiBookOpen, FiLayers, FiBox,
  FiShoppingCart, FiArrowRight, FiActivity, FiDollarSign, FiUser,
  FiFileText, FiPackage, FiBarChart2,
} from 'react-icons/fi';

// ─── 型定義 ─────────────────────────────────
type CategoryKey = 'all' | 'prompt' | 'claude-skill' | 'gpt' | 'agent' | 'autotrade' | 'script' | 'data' | 'template' | 'course';

// IRBANK採用認定レベル
type IRBANKTier = null | 'verified' | 'featured' | 'powered';

interface Product {
  id: string;
  title: string;
  description: string;
  category: CategoryKey;
  price: number;
  isMonthly?: boolean;
  creator: string;
  creatorAvatar: string;
  rating: number;
  reviewCount: number;
  purchaseCount: number;
  weeklyChange: number; // 週間販売数の変化率
  badges?: string[];
  affiliateRate: number; // %
  thumbnail: string;
  irbankTier?: IRBANKTier; // IRBANK採用認定レベル
  monthlyUsers?: number; // Powered by IRBANK時の月間利用ユーザー数
}

// IRBANK認定レベル定義
const IRBANK_TIER_CONFIG = {
  verified: {
    label: 'IRBANK Verified',
    shortLabel: '✓ Verified',
    icon: '🥉',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeColor: 'bg-blue-600',
    description: 'IRBANK動作確認済み。信頼性が保証されています。',
    creatorRevShare: 90,
  },
  featured: {
    label: 'IRBANK Featured',
    shortLabel: '⭐ Featured',
    icon: '🥈',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeColor: 'bg-purple-600',
    description: 'IRBANK公式が推薦するピックアップ商品。トップ露出されます。',
    creatorRevShare: 80,
  },
  powered: {
    label: 'Powered by IRBANK',
    shortLabel: '⚡ Powered',
    icon: '🥇',
    color: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-300',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
    description: 'IRBANK公式機能として統合済み。サイト内で誰でも利用可能、利用回数で報酬が発生します。',
    creatorRevShare: 60,
  },
} as const;

// ─── モックデータ ─────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: '決算短信を15秒で要約するAIエージェント',
    description: 'IRBANK APIと連携し、開示直後の決算短信を自動で要点抽出。投資判断を即座にサポートします。',
    category: 'agent',
    price: 1500,
    isMonthly: true,
    creator: '投資アナリストK',
    creatorAvatar: 'K',
    rating: 4.8,
    reviewCount: 234,
    purchaseCount: 1820,
    weeklyChange: 28.5,
    badges: ['🔥 急上昇', '⭐ TOP10'],
    affiliateRate: 50,
    thumbnail: '📊',
    irbankTier: 'powered',
    monthlyUsers: 28400,
  },
  {
    id: 'p2',
    title: 'バフェット流バリュー投資スクリーニング・プロンプト',
    description: 'PER・PBR・ROE等の財務指標から「お買い得」銘柄を自動抽出するChatGPT/Claudeプロンプト集。',
    category: 'prompt',
    price: 980,
    creator: 'バリュー太郎',
    creatorAvatar: 'B',
    rating: 4.6,
    reviewCount: 567,
    purchaseCount: 3450,
    weeklyChange: 12.3,
    badges: ['📈 ベストセラー'],
    affiliateRate: 40,
    thumbnail: '💎',
  },
  {
    id: 'p3',
    title: '日経225オプション 自動アラートBot',
    description: 'ATM IV・スキューを監視し、優位性のあるエントリーポイントを自動通知。',
    category: 'agent',
    price: 4980,
    isMonthly: true,
    creator: 'OptionMaster',
    creatorAvatar: 'O',
    rating: 4.9,
    reviewCount: 89,
    purchaseCount: 412,
    weeklyChange: 45.2,
    badges: ['⚡ 新着'],
    affiliateRate: 50,
    thumbnail: '⚡',
  },
  {
    id: 'p4',
    title: '過去20年・全上場企業財務指標データセット',
    description: '40,000銘柄 × 240四半期分の財務指標CSV。バックテスト・機械学習に最適。',
    category: 'data',
    price: 12800,
    creator: 'DataLab Inc.',
    creatorAvatar: 'D',
    rating: 4.7,
    reviewCount: 156,
    purchaseCount: 890,
    weeklyChange: 8.1,
    badges: ['🏆 認証'],
    affiliateRate: 30,
    thumbnail: '📁',
    irbankTier: 'verified',
  },
  {
    id: 'p5',
    title: 'Claude Code 投資AIエージェント開発講座',
    description: '実際にClaude Codeを使って投資分析AIを構築する全15時間の実践講座（動画+資料）。',
    category: 'course',
    price: 29800,
    creator: '陸斗',
    creatorAvatar: 'R',
    rating: 5.0,
    reviewCount: 42,
    purchaseCount: 156,
    weeklyChange: 67.8,
    badges: ['🎓 講座'],
    affiliateRate: 50,
    thumbnail: '🎬',
  },
  {
    id: 'p6',
    title: 'TradingView Pine Script - 移動平均クロス改良版',
    description: 'ノイズフィルター搭載でダマシを80%削減。実証済みストラテジー。',
    category: 'script',
    price: 2480,
    creator: 'TradingPro',
    creatorAvatar: 'T',
    rating: 4.5,
    reviewCount: 312,
    purchaseCount: 1240,
    weeklyChange: -3.2,
    affiliateRate: 35,
    thumbnail: '📈',
  },
  {
    id: 'p7',
    title: '決算プレゼン資料テンプレート（IRBANK連動）',
    description: 'IRBANKデータを差し込むだけで決算分析プレゼンが完成。Notion/Figma対応。',
    category: 'template',
    price: 3980,
    creator: 'プレゼンマスター',
    creatorAvatar: 'P',
    rating: 4.4,
    reviewCount: 78,
    purchaseCount: 320,
    weeklyChange: 15.6,
    affiliateRate: 40,
    thumbnail: '📑',
  },
  {
    id: 'p8',
    title: 'AI銘柄スコアリングモデル（Python）',
    description: '財務+テクニカル+センチメントから0-100点で銘柄評価。バックテスト結果付き。',
    category: 'agent',
    price: 9800,
    creator: 'クオンツ研究所',
    creatorAvatar: 'Q',
    rating: 4.9,
    reviewCount: 124,
    purchaseCount: 567,
    weeklyChange: 32.1,
    badges: ['🏆 認証', '📈 高評価'],
    affiliateRate: 45,
    thumbnail: '🧮',
    irbankTier: 'featured',
  },
  // ─── Claude Skill ───
  {
    id: 'p9',
    title: '財務分析専門家 Claude Skill',
    description: 'Claude Codeにインストールするだけで、財務諸表の分析・異常値検出・トレンド予測ができる専門スキル。.mdファイル形式。',
    category: 'claude-skill',
    price: 1980,
    creator: '陸斗',
    creatorAvatar: 'R',
    rating: 4.9,
    reviewCount: 67,
    purchaseCount: 480,
    weeklyChange: 52.3,
    badges: ['⚡ 新着', '🔥 急上昇'],
    affiliateRate: 50,
    thumbnail: '📜',
  },
  {
    id: 'p10',
    title: 'バックテスト自動化スキルパック（5本セット）',
    description: 'Claude Code用Skill。バックテスト計画→実装→評価→改善まで自動化。投資戦略開発が10倍速に。',
    category: 'claude-skill',
    price: 4980,
    creator: 'クオンツ研究所',
    creatorAvatar: 'Q',
    rating: 4.7,
    reviewCount: 92,
    purchaseCount: 318,
    weeklyChange: 24.6,
    badges: ['📦 セット商品'],
    affiliateRate: 45,
    thumbnail: '⚙️',
  },
  {
    id: 'p11',
    title: '決算書ハンター Claude Skill',
    description: '「決算が出たら教えて」と言うだけで、IRBANK連携で最新決算を取得・要約・通知してくれるスキル。',
    category: 'claude-skill',
    price: 1280,
    isMonthly: true,
    creator: '投資アナリストK',
    creatorAvatar: 'K',
    rating: 4.8,
    reviewCount: 145,
    purchaseCount: 892,
    weeklyChange: 38.4,
    badges: ['📈 ベストセラー'],
    affiliateRate: 50,
    thumbnail: '🎯',
    irbankTier: 'powered',
    monthlyUsers: 12800,
  },
  // ─── カスタムGPT ───
  {
    id: 'p12',
    title: '株式投資メンター GPT',
    description: 'OpenAI GPTs。投資初心者から中級者まで、24時間質問に答える投資家育成AI。日本株・米国株対応。',
    category: 'gpt',
    price: 980,
    isMonthly: true,
    creator: 'バリュー太郎',
    creatorAvatar: 'B',
    rating: 4.6,
    reviewCount: 287,
    purchaseCount: 1450,
    weeklyChange: 18.7,
    badges: ['🎓 教育'],
    affiliateRate: 40,
    thumbnail: '🎓',
  },
  {
    id: 'p13',
    title: 'IPO評価アナリスト GPT',
    description: 'IPO目論見書を分析して投資価値を5段階評価。過去の上場企業データで学習済み。',
    category: 'gpt',
    price: 2980,
    creator: 'IPOマスター',
    creatorAvatar: 'I',
    rating: 4.5,
    reviewCount: 56,
    purchaseCount: 234,
    weeklyChange: 41.2,
    badges: ['🆕 新着'],
    affiliateRate: 45,
    thumbnail: '🚀',
  },
  // ─── 自動売買Bot ───
  {
    id: 'p14',
    title: '日本株デイトレ自動売買Bot - グランビル改良版',
    description: 'SBI証券API対応。グランビルの法則を改良したロジックで日中の売買を完全自動化。年間勝率68%（バックテスト実績）。',
    category: 'autotrade',
    price: 19800,
    isMonthly: true,
    creator: 'AutoTrade Master',
    creatorAvatar: 'A',
    rating: 4.7,
    reviewCount: 89,
    purchaseCount: 234,
    weeklyChange: 56.2,
    badges: ['🔥 急上昇', '🏆 認証'],
    affiliateRate: 50,
    thumbnail: '🤖',
    irbankTier: 'featured',
  },
  {
    id: 'p15',
    title: '米国株スイング自動売買Bot - モメンタム戦略',
    description: 'Alpaca API対応。RSI+MACD+出来高でエントリー、ATRストップロス。米国株式市場対応。',
    category: 'autotrade',
    price: 9800,
    isMonthly: true,
    creator: 'クオンツ研究所',
    creatorAvatar: 'Q',
    rating: 4.8,
    reviewCount: 156,
    purchaseCount: 489,
    weeklyChange: 28.4,
    badges: ['📈 ベストセラー'],
    affiliateRate: 45,
    thumbnail: '📊',
  },
  {
    id: 'p16',
    title: 'FX自動売買EA - スキャルピング特化',
    description: 'MetaTrader5用EA。USD/JPY/EUR/USDのスキャルピング。月利平均8-12%（過去2年実績）。',
    category: 'autotrade',
    price: 29800,
    creator: 'FX Pro Trader',
    creatorAvatar: 'F',
    rating: 4.5,
    reviewCount: 234,
    purchaseCount: 678,
    weeklyChange: 15.8,
    badges: ['📦 買い切り'],
    affiliateRate: 40,
    thumbnail: '💹',
  },
  {
    id: 'p17',
    title: '仮想通貨アービトラージBot',
    description: '複数取引所間の価格差を自動検出して鞘取り。Binance/Bybit/Bitflyer対応。月利目安3-5%。',
    category: 'autotrade',
    price: 14800,
    isMonthly: true,
    creator: 'Crypto Hacker',
    creatorAvatar: 'C',
    rating: 4.6,
    reviewCount: 78,
    purchaseCount: 312,
    weeklyChange: 67.3,
    badges: ['⚡ 新着', '🔥 急上昇'],
    affiliateRate: 50,
    thumbnail: '₿',
  },
  {
    id: 'p18',
    title: '日経225先物 自動売買Bot - 寄り引け戦略',
    description: '前日終値からのギャップを利用した寄り引け戦略を完全自動化。CFD対応。',
    category: 'autotrade',
    price: 12800,
    isMonthly: true,
    creator: '先物マスター',
    creatorAvatar: 'F',
    rating: 4.4,
    reviewCount: 45,
    purchaseCount: 167,
    weeklyChange: 22.1,
    affiliateRate: 45,
    thumbnail: '⚡',
  },
];

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'all', label: '全て', icon: <FiBox className="w-4 h-4" />, color: 'gray' },
  { key: 'prompt', label: 'プロンプト', icon: <FiZap className="w-4 h-4" />, color: 'amber' },
  { key: 'claude-skill', label: 'Claude Skill', icon: <FiFileText className="w-4 h-4" />, color: 'orange' },
  { key: 'gpt', label: 'カスタムGPT', icon: <FiPackage className="w-4 h-4" />, color: 'emerald' },
  { key: 'agent', label: 'AIエージェント', icon: <FiCpu className="w-4 h-4" />, color: 'blue' },
  { key: 'autotrade', label: '自動売買Bot', icon: <FiBarChart2 className="w-4 h-4" />, color: 'red' },
  { key: 'script', label: 'スクリプト', icon: <FiCode className="w-4 h-4" />, color: 'purple' },
  { key: 'data', label: 'データセット', icon: <FiDatabase className="w-4 h-4" />, color: 'green' },
  { key: 'template', label: 'テンプレート', icon: <FiLayers className="w-4 h-4" />, color: 'pink' },
  { key: 'course', label: '動画講座', icon: <FiBookOpen className="w-4 h-4" />, color: 'red' },
];

// ─── トップページ ─────────────────────────────
export function AlphaSharePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_PRODUCTS.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const trending = [...MOCK_PRODUCTS].sort((a, b) => b.weeklyChange - a.weeklyChange).slice(0, 4);
  const topRated = [...MOCK_PRODUCTS].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount).slice(0, 4);
  const newest = MOCK_PRODUCTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── ヒーロー ─── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">α</span>
            <span className="text-xl font-bold tracking-wide">AlphaShare</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full border border-white/20">BETA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            投資の<span className="text-amber-400">アルファ</span>を、<br />
            シェアで共に拡げる。
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl">
            AI制作物・スクリプト・データを売買できる投資家のためのマーケットプレイス。
            購入したスキルを紹介すれば、最大<strong className="text-amber-400">50%の報酬</strong>があなたに還元されます。
          </p>

          {/* 統計バッジ */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <div className="text-2xl font-black text-amber-400">2,847</div>
              <div className="text-blue-200">出品商品</div>
            </div>
            <div className="border-l border-white/20 pl-6">
              <div className="text-2xl font-black text-amber-400">¥48.2M</div>
              <div className="text-blue-200">累計取引額</div>
            </div>
            <div className="border-l border-white/20 pl-6">
              <div className="text-2xl font-black text-amber-400">12,450</div>
              <div className="text-blue-200">アクティブユーザー</div>
            </div>
            <div className="border-l border-white/20 pl-6">
              <div className="text-2xl font-black text-amber-400">¥8.4M</div>
              <div className="text-blue-200">アフィリエイト還元</div>
            </div>
          </div>

          {/* 検索バー */}
          <div className="mt-10 relative max-w-2xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="プロンプト、AIエージェント、データを検索..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:bg-white/15 focus:border-amber-400/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ─── カテゴリ ─── */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.key
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* ─── トレンディング（急上昇） ─── */}
        {category === 'all' && !searchQuery && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-orange-500" />
                  急上昇中のAI資産
                </h2>
                <p className="text-sm text-gray-500 mt-1">過去7日で販売数が伸びている注目商品</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                すべて見る <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trending.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => navigate(`/alphashare/product/${p.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* ─── 高評価ランキング ─── */}
        {category === 'all' && !searchQuery && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-amber-500" />
                  高評価ランキング
                </h2>
                <p className="text-sm text-gray-500 mt-1">投資家から最も支持されているAI資産</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {topRated.map((p, i) => (
                <RankingRow key={p.id} product={p} rank={i + 1} onClick={() => navigate(`/alphashare/product/${p.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* ─── IRBANK採用システム（コンパクト版） ─── */}
        {category === 'all' && !searchQuery && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl overflow-hidden">
              {/* ヘッダー部分 */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">⚡</span>
                      <h2 className="text-xl font-black text-white">IRBANK採用システム</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Official
                      </span>
                    </div>
                    <p className="text-sm text-blue-100 max-w-2xl">
                      優秀な商品はIRBANKが認定し、公式機能として統合。利用ごとに制作者へ自動的に報酬が還元される仕組みです。
                    </p>
                  </div>
                  <button className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-medium flex-shrink-0">
                    認定基準 <FiArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* 3段階バッジを1行で */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {(['verified', 'featured', 'powered'] as const).map(tier => {
                    const cfg = IRBANK_TIER_CONFIG[tier];
                    return (
                      <div key={tier} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
                        <span className="text-xs">{cfg.icon}</span>
                        <span className="text-[11px] font-bold text-white">{cfg.label}</span>
                        <span className="text-[10px] text-blue-200">制作者{cfg.creatorRevShare}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 採用商品 */}
              <div className="bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">採用済み商品</span>
                  <span className="text-xs text-gray-400">{MOCK_PRODUCTS.filter(p => p.irbankTier).length}件</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {MOCK_PRODUCTS.filter(p => p.irbankTier).slice(0, 4).map(p => {
                    const cfg = p.irbankTier ? IRBANK_TIER_CONFIG[p.irbankTier] : null;
                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/alphashare/product/${p.id}`)}
                        className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg flex-shrink-0">
                            {p.thumbnail}
                          </div>
                          <div className="flex-1 min-w-0">
                            {cfg && (
                              <div className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${cfg.color} mb-1`}>
                                {cfg.icon} {cfg.shortLabel}
                              </div>
                            )}
                            <div className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight">{p.title}</div>
                          </div>
                        </div>
                        {p.monthlyUsers && (
                          <div className="text-[10px] text-amber-600 font-medium flex items-center gap-1 pt-1.5 border-t border-gray-100">
                            <FiUsers className="w-3 h-3" /> 月間{p.monthlyUsers.toLocaleString()}人が利用中
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── 全商品/絞り込み結果 ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {category === 'all' ? '全ての商品' : CATEGORIES.find(c => c.key === category)?.label}
              <span className="text-sm font-normal text-gray-400 ml-2">{filtered.length}件</span>
            </h2>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option>人気順</option>
              <option>新着順</option>
              <option>価格が安い順</option>
              <option>価格が高い順</option>
              <option>評価が高い順</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => navigate(`/alphashare/product/${p.id}`)} />
            ))}
          </div>
        </section>

        {/* ─── トップクリエイター ─── */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FiUsers className="w-5 h-5 text-purple-500" />
            トップクリエイター
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {['投資アナリストK', 'バリュー太郎', 'OptionMaster', 'クオンツ研究所', '陸斗'].map((name, i) => (
              <div key={name} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 transition-colors cursor-pointer">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mb-2">
                  {name.charAt(0)}
                </div>
                <div className="text-sm font-bold text-gray-800">{name}</div>
                <div className="text-xs text-gray-400 mt-0.5">フォロワー {(1000 - i * 150).toLocaleString()}</div>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-amber-500">
                  <FiStar className="w-3 h-3 fill-current" /> {(4.9 - i * 0.1).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── アフィリエイト誘導バナー ─── */}
        <section className="mt-16 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white text-2xl flex-shrink-0">
              💰
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">買って、紹介して、稼ぐ。</h3>
              <p className="text-gray-700 mb-4">
                AlphaShareでは、購入したAI資産をあなたのリンク経由で他の投資家に紹介することで、
                <strong className="text-amber-700">最大50%のアフィリエイト報酬</strong>を獲得できます。
                AI資産は新しい「投資商品」です。
              </p>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors">
                アフィリエイトの仕組みを見る <FiArrowRight />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// ─── 商品カード ─────────────────────────────
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const tierConfig = product.irbankTier ? IRBANK_TIER_CONFIG[product.irbankTier] : null;

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group relative ${
        product.irbankTier === 'powered' ? 'border-amber-300 ring-2 ring-amber-200/50' :
        product.irbankTier === 'featured' ? 'border-purple-300' :
        'border-gray-200 hover:border-blue-400'
      }`}
    >
      {/* IRBANK採用バッジ */}
      {tierConfig && (
        <div className={`absolute -top-2.5 left-4 ${tierConfig.badgeColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md`}>
          {tierConfig.icon} {tierConfig.label}
        </div>
      )}

      {/* バッジ */}
      {product.badges && (
        <div className={`flex flex-wrap gap-1.5 mb-3 ${tierConfig ? 'mt-2' : ''}`}>
          {product.badges.map(b => (
            <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {b}
            </span>
          ))}
        </div>
      )}

      {/* サムネイル + タイトル */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
          {product.thumbnail}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700">
            {product.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[8px] font-bold">
              {product.creatorAvatar}
            </div>
            {product.creator}
          </div>
        </div>
      </div>

      {/* 説明 */}
      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{product.description}</p>

      {/* メトリクス */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 pt-2 border-t border-gray-100">
        <span className="flex items-center gap-0.5 text-amber-500">
          <FiStar className="w-3 h-3 fill-current" />
          <span className="font-bold">{product.rating}</span>
          <span className="text-gray-400">({product.reviewCount})</span>
        </span>
        <span className="flex items-center gap-0.5">
          <FiShoppingCart className="w-3 h-3" /> {product.purchaseCount.toLocaleString()}
        </span>
        <span className={`flex items-center gap-0.5 ml-auto font-medium ${product.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {product.weeklyChange >= 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
          {product.weeklyChange >= 0 ? '+' : ''}{product.weeklyChange}%
        </span>
      </div>

      {/* 価格 + アフィ報酬 */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xl font-black text-gray-900">
            ¥{product.price.toLocaleString()}
            {product.isMonthly && <span className="text-xs font-normal text-gray-400 ml-1">/月</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">アフィ報酬</div>
          <div className="text-sm font-bold text-amber-600">最大 {product.affiliateRate}%</div>
        </div>
      </div>
    </div>
  );
}

// ─── ランキング行 ─────────────────────────────
function RankingRow({ product, rank, onClick }: { product: Product; rank: number; onClick: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
        rank === 1 ? 'bg-amber-400 text-white' :
        rank === 2 ? 'bg-gray-300 text-white' :
        rank === 3 ? 'bg-amber-700 text-white' :
        'bg-gray-100 text-gray-600'
      }`}>
        {rank}
      </div>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl flex-shrink-0">
        {product.thumbnail}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-sm truncate">{product.title}</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
          <span>{product.creator}</span>
          <span className="text-amber-500 flex items-center gap-0.5">
            <FiStar className="w-3 h-3 fill-current" /> {product.rating}
          </span>
          <span>購入数 {product.purchaseCount.toLocaleString()}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-base font-black text-gray-900">¥{product.price.toLocaleString()}{product.isMonthly && <span className="text-xs font-normal">/月</span>}</div>
        <div className="text-xs text-amber-600 font-medium">アフィ {product.affiliateRate}%</div>
      </div>
    </div>
  );
}
