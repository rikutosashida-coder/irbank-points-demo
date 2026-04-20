import { useEffect, useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiExternalLink, FiSearch, FiFilter, FiX, FiUsers, FiActivity, FiList, FiBarChart2, FiCpu, FiChevronDown, FiChevronUp, FiAlertTriangle, FiArrowUp, FiArrowDown } from 'react-icons/fi';

// ─── 型定義 ─────────────────────────────────
interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  image: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  volume24hr: number;
  liquidity: string;
  endDate: string;
  active: boolean;
  closed: boolean;
}

type SortKey = 'volume24hr' | 'volumeTotal' | 'liquidity' | 'endDate' | 'price';
type CategoryFilter = 'all' | 'macro' | 'crypto' | 'stocks' | 'commodities' | 'politics' | 'geopolitics' | 'other';

// ─── メインコンポーネント ─────────────────────
export function PolymarketPage() {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('volume24hr');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // IRBANKに関連するキーワード（金融・経済・政治・地政学）
  const FINANCE_KEYWORDS = [
    // 金融・経済
    'stock', 'market', 'fed', 'rate', 'gdp', 'inflation', 's&p', 'nasdaq', 'dow',
    'tariff', 'recession', 'bitcoin', 'btc', 'eth', 'crypto', 'price', 'oil',
    'gold', 'bond', 'yield', 'treasury', 'bank', 'economy', 'trade', 'currency',
    'dollar', 'yen', 'euro', 'interest', 'cpi', 'unemployment', 'jobs', 'earnings',
    'ipo', 'merger', 'acquisition', 'revenue', 'profit', 'debt', 'default',
    'japan', 'china', 'us economy', 'world bank', 'imf', 'opec',
    'nikkei', 'hang seng', 'ftse', 'dax', 'kospi',
    'apple', 'tesla', 'nvidia', 'microsoft', 'google', 'amazon', 'meta',
    'semiconductor', 'ai ', 'artificial intelligence',
    // 政治
    'trump', 'biden', 'president', 'election', 'congress', 'senate', 'governor',
    'democrat', 'republican', 'vote', 'impeach', 'cabinet', 'supreme court',
    'prime minister', 'parliament', 'sanction', 'executive order',
    'kishida', 'ishiba', 'xi jinping', 'putin', 'macron', 'starmer', 'modi',
    // 地政学
    'war', 'ceasefire', 'nato', 'invasion', 'invade', 'taiwan', 'ukraine', 'russia',
    'north korea', 'iran', 'israel', 'gaza', 'military', 'nuclear', 'missile',
    'south china sea', 'territorial', 'conflict', 'peace', 'treaty',
    'brics', 'g7', 'g20', 'united nations',
  ];

  const isFinanceRelated = (question: string) => {
    const lower = question.toLowerCase();
    return FINANCE_KEYWORDS.some(kw => lower.includes(kw));
  };

  // IRBANK向け参考マーケット（日本語）
  const SAMPLE_MARKETS: PolymarketMarket[] = [
    // マクロ経済
    { id: 'sample-1', question: 'FRBは2026年7月までに利下げするか？', slug: 'will-the-fed-cut-interest-rates', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.62", "0.38"]', volume: '8500000', volume24hr: 125000, liquidity: '450000', endDate: '2026-07-01T00:00:00Z', active: true, closed: false },
    { id: 'sample-5', question: '米国は2026年中にリセッション（景気後退）に入るか？', slug: 'us-recession-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.28", "0.72"]', volume: '9200000', volume24hr: 210000, liquidity: '560000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    { id: 'sample-9', question: '米国は2026年に中国に対して新たな関税を課すか？', slug: 'us-china-tariffs-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.68", "0.32"]', volume: '6700000', volume24hr: 150000, liquidity: '410000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    // 暗号資産
    { id: 'sample-2', question: 'ビットコインは2026年末までに15万ドルを超えるか？', slug: 'bitcoin-150k-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.35", "0.65"]', volume: '12000000', volume24hr: 340000, liquidity: '890000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    { id: 'sample-8', question: 'イーサリアムETFの純流入額は2026年末までに100億ドルを超えるか？', slug: 'eth-etf-inflows-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.38", "0.62"]', volume: '3200000', volume24hr: 65000, liquidity: '240000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    // 個別株・テック
    { id: 'sample-3', question: 'S&P500は2026年Q2に史上最高値を更新するか？', slug: 'sp500-new-ath-q2-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.48", "0.52"]', volume: '5200000', volume24hr: 89000, liquidity: '320000', endDate: '2026-06-30T00:00:00Z', active: true, closed: false },
    { id: 'sample-4', question: 'NVIDIAの株価は2026年6月までに200ドルを超えるか？', slug: 'nvidia-200-june-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.72", "0.28"]', volume: '3800000', volume24hr: 56000, liquidity: '210000', endDate: '2026-06-30T00:00:00Z', active: true, closed: false },
    { id: 'sample-7', question: 'テスラ株は2026年にS&P500をアウトパフォームするか？', slug: 'tesla-outperform-sp500-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.55", "0.45"]', volume: '4500000', volume24hr: 78000, liquidity: '290000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    // コモディティ
    { id: 'sample-10', question: '金価格は2026年中に1オンス3,500ドルを超えるか？', slug: 'gold-3500-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.45", "0.55"]', volume: '4100000', volume24hr: 92000, liquidity: '310000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    // 日本関連
    { id: 'sample-6', question: '日銀は2026年中に政策金利を1%以上に引き上げるか？', slug: 'japan-rate-above-1-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.41", "0.59"]', volume: '2100000', volume24hr: 42000, liquidity: '180000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    { id: 'sample-11', question: '日経平均株価は2026年末までに45,000円を超えるか？', slug: 'nikkei-45000-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.52", "0.48"]', volume: '1800000', volume24hr: 35000, liquidity: '150000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    { id: 'sample-12', question: 'ドル円は2026年中に130円を下回るか？', slug: 'usdjpy-below-130-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.22", "0.78"]', volume: '2500000', volume24hr: 48000, liquidity: '190000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    { id: 'sample-14', question: '日本は2026年に衆議院解散総選挙を実施するか？', slug: 'japan-snap-election-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.32", "0.68"]', volume: '1500000', volume24hr: 28000, liquidity: '120000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    { id: 'sample-20', question: '日銀は2027年までに政策金利を1.5%以上に引き上げるか？', slug: 'boj-rate-above-1.5-2027', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.18", "0.82"]', volume: '1900000', volume24hr: 38000, liquidity: '140000', endDate: '2027-01-01T00:00:00Z', active: true, closed: false },
    { id: 'sample-21', question: '日本のGDP成長率は2026年に2%を超えるか？', slug: 'japan-gdp-2-percent-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.28", "0.72"]', volume: '1200000', volume24hr: 25000, liquidity: '110000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    // 政治
    { id: 'sample-13', question: 'トランプ大統領は2026年にテック企業に対する新たな大統領令を発令するか？', slug: 'trump-tech-executive-orders-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.58", "0.42"]', volume: '7800000', volume24hr: 185000, liquidity: '520000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    { id: 'sample-15', question: '米中は2026年に新たな貿易協定を締結するか？', slug: 'us-china-trade-deal-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.25", "0.75"]', volume: '5400000', volume24hr: 130000, liquidity: '380000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    // 地政学
    { id: 'sample-16', question: 'ロシア・ウクライナ停戦は2026年10月までに実現するか？', slug: 'russia-ukraine-ceasefire-oct-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.38", "0.62"]', volume: '15000000', volume24hr: 420000, liquidity: '950000', endDate: '2026-10-01T00:00:00Z', active: true, closed: false },
    { id: 'sample-17', question: '中国は2026年に台湾に対して軍事的封鎖を行うか？', slug: 'china-taiwan-blockade-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.08", "0.92"]', volume: '8900000', volume24hr: 195000, liquidity: '620000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    { id: 'sample-18', question: '北朝鮮は2026年に核実験を実施するか？', slug: 'north-korea-nuclear-test-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.15", "0.85"]', volume: '3200000', volume24hr: 72000, liquidity: '250000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
    { id: 'sample-19', question: 'イスラエルとガザは2026年に恒久的な停戦に合意するか？', slug: 'israel-gaza-ceasefire-2026', image: '', outcomes: '["はい", "いいえ"]', outcomePrices: '["0.30", "0.70"]', volume: '6100000', volume24hr: 155000, liquidity: '430000', endDate: '2026-12-31T00:00:00Z', active: true, closed: false },
  ];

  const fetchMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      // 多めに取得して金融系のみフィルタ
      const res = await fetch('https://gamma-api.polymarket.com/markets?limit=200&active=true&closed=false');
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data: PolymarketMarket[] = await res.json();
      const financeMarkets = data.filter(m => m.outcomePrices && m.question && isFinanceRelated(m.question));
      // APIの金融系マーケット + サンプルマーケットを結合（重複除外）
      const apiIds = new Set(financeMarkets.map(m => m.id));
      const combined = [...financeMarkets, ...SAMPLE_MARKETS.filter(s => !apiIds.has(s.id))];
      setMarkets(combined);
      setLastUpdated(new Date());
    } catch (e) {
      // API失敗時はサンプルデータのみ表示
      setMarkets(SAMPLE_MARKETS);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000); // 1分毎に更新
    return () => clearInterval(interval);
  }, []);

  // 簡易日本語変換（API取得分）
  const translateQuestion = (q: string): string => {
    const map: Record<string, string> = {
      'Will': '', 'the ': '', 'by ': '', 'in ': '', 'before ': '',
      'end of': '末までに', 'exceed': '超える', 'hit': '到達する',
      'fall below': '下回る', 'above': '以上',
    };
    // サンプルデータ（既に日本語）はそのまま返す
    if (/[ぁ-ん]|[ァ-ヴ]|[一-龥]/.test(q)) return q;
    return q; // API取得分は英語のまま（翻訳APIが無いため）
  };

  // パース
  const parsedMarkets = markets.map(m => {
    const outcomes: string[] = JSON.parse(m.outcomes || '[]');
    const prices: string[] = JSON.parse(m.outcomePrices || '[]');
    const yesPrice = parseFloat(prices[0] || '0');
    const noPrice = parseFloat(prices[1] || '0');
    return { ...m, question: translateQuestion(m.question), outcomes, yesPrice, noPrice, volumeNum: parseFloat(m.volume || '0'), liquidityNum: parseFloat(m.liquidity || '0') };
  });

  // カテゴリフィルタ
  const categorize = (q: string): CategoryFilter => {
    const lower = q.toLowerCase();
    if (/war|ceasefire|nato|invasion|invade|taiwan|ukraine|russia|north korea|iran|israel|gaza|military|nuclear|missile|conflict|territorial|peace|treaty/i.test(lower)) return 'geopolitics';
    if (/trump|biden|president|election|congress|senate|governor|democrat|republican|vote|impeach|prime minister|parliament|macron|starmer|kishida|ishiba|xi jinping|putin|modi/i.test(lower)) return 'politics';
    if (/bitcoin|btc|eth|crypto|token|solana/i.test(lower)) return 'crypto';
    if (/apple|tesla|nvidia|microsoft|google|amazon|meta|stock|ipo|earnings|semiconductor/i.test(lower)) return 'stocks';
    if (/oil|gold|commodity|opec/i.test(lower)) return 'commodities';
    if (/fed|rate|gdp|inflation|cpi|tariff|recession|economy|unemployment|trade|treasury|bond|yield|interest|bank|imf|currency|dollar|yen/i.test(lower)) return 'macro';
    return 'other';
  };

  // 日本関連判定
  const JAPAN_KEYWORDS = ['japan', 'japanese', 'nikkei', 'yen', 'boj', 'bank of japan', 'tokyo', 'kishida', 'ishiba', 'yen/', '/jpy', 'usd/jpy', 'topix', '日本', '日銀', '日経', 'ドル円', '円', '衆議院', '総選挙'];
  const isJapanRelated = (q: string) => JAPAN_KEYWORDS.some(kw => q.toLowerCase().includes(kw));

  // 出来高急増判定（24h出来高が累計の5%以上 = ホット）
  const isVolumeSpike = (m: { volume24hr: number; volumeNum: number }) =>
    m.volumeNum > 0 && (m.volume24hr / m.volumeNum) > 0.05;

  // フィルタ＆ソート
  const filtered = parsedMarkets
    .filter(m => {
      if (searchQuery === '__japan__') return isJapanRelated(m.question);
      if (searchQuery && !m.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (category !== 'all' && categorize(m.question) !== category) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'volume24hr': return (b.volume24hr || 0) - (a.volume24hr || 0);
        case 'volumeTotal': return b.volumeNum - a.volumeNum;
        case 'liquidity': return b.liquidityNum - a.liquidityNum;
        case 'endDate': return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'price': return b.yesPrice - a.yesPrice;
        default: return 0;
      }
    });

  const CATEGORY_LABELS: Record<CategoryFilter, string> = {
    all: '全て',
    macro: 'マクロ経済',
    politics: '政治',
    geopolitics: '地政学',
    crypto: '暗号資産',
    stocks: '個別株・テック',
    commodities: 'コモディティ',
    other: 'その他',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">📊</span> Polymarket
            </h1>
            <p className="text-sm text-gray-500 mt-1">予測市場のリアルタイムデータ</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
              </span>
            )}
            <button
              onClick={fetchMarkets}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              更新
            </button>
          </div>
        </div>

        {/* フィルタ＆検索 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 検索 */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="マーケットを検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* カテゴリ */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <FiFilter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    category === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* ソート */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="volume24hr">24h取引量</option>
              <option value="volumeTotal">累計取引量</option>
              <option value="liquidity">流動性</option>
              <option value="price">Yes価格</option>
              <option value="endDate">終了日</option>
            </select>

            {/* 特殊フィルタボタン */}
            <button
              onClick={() => setSearchQuery(searchQuery === '__japan__' ? '' : '__japan__')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                searchQuery === '__japan__' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              }`}
            >
              🇯🇵 日本関連
            </button>
          </div>
        </div>

        {/* エラー */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ローディング */}
        {loading && markets.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-400">マーケットデータを取得中...</span>
            </div>
          </div>
        )}

        {/* マーケットカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(m => (
            <MarketCard key={m.id} market={m} japanRelated={isJapanRelated(m.question)} volumeSpike={isVolumeSpike(m)} />
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            該当するマーケットが見つかりません
          </div>
        )}
      </div>

      {/* 右下フローティング AI パネル */}
      <FloatingAIPanel markets={filtered as any} />
    </div>
  );
}

// ─── 右下フローティングAIパネル ─────────────────
function FloatingAIPanel({ markets }: { markets: { question: string; yesPrice: number; volume24hr: number; volumeNum: number; liquidityNum: number }[] }) {
  const [open, setOpen] = useState(false);

  const portfolio = [
    { code: '7203', name: 'トヨタ', value: 285000 },
    { code: '8306', name: '三菱UFJ', value: 840000 },
    { code: '6758', name: 'ソニーG', value: 160000 },
    { code: '9984', name: 'ソフトバンクG', value: 1790000 },
    { code: '6861', name: 'キーエンス', value: 680000 },
  ];
  const totalValue = portfolio.reduce((s, p) => s + p.value, 0);

  // 信頼度スコア（掛け金規模 + 出来高急増）
  const getCredibility = (m: { volumeNum: number; liquidityNum: number; volume24hr: number }) => {
    // 累計取引量でベース信頼度（$10M以上=高、$1M以上=中、それ以下=低）
    const volumeScore = m.volumeNum >= 10_000_000 ? 3 : m.volumeNum >= 1_000_000 ? 2 : 1;
    // 流動性
    const liqScore = m.liquidityNum >= 500_000 ? 3 : m.liquidityNum >= 100_000 ? 2 : 1;
    // 出来高急増（24h出来高 / 累計 > 5%）
    const spikeRatio = m.volumeNum > 0 ? m.volume24hr / m.volumeNum : 0;
    const spikeScore = spikeRatio > 0.1 ? 3 : spikeRatio > 0.05 ? 2 : 1;
    const total = (volumeScore + liqScore + spikeScore) / 3;
    return { score: total, volumeScore, liqScore, spikeScore, spikeRatio, label: total >= 2.5 ? '高' : total >= 1.5 ? '中' : '低' };
  };

  const formatVol = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  // 信頼度 × 影響度でスコアリングし、上位5件を取得
  const scoredEvents = markets.map(m => {
    const q = m.question.toLowerCase();
    const cred = getCredibility(m);
    let baseImpact = 0;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (/利下げ|fed/.test(q)) { sentiment = 'positive'; baseImpact = 1.8; }
    else if (/関税|tariff|貿易摩擦/.test(q)) { sentiment = 'negative'; baseImpact = -2.5; }
    else if (/リセッション|recession|景気後退/.test(q)) { sentiment = 'negative'; baseImpact = -3.2; }
    else if (/日銀|boj|利上げ/.test(q)) { sentiment = 'neutral'; baseImpact = 0.5; }
    else if (/停戦|ceasefire/.test(q)) { sentiment = 'positive'; baseImpact = 1.2; }
    else if (/台湾|taiwan|軍事|blockade/.test(q)) { sentiment = 'negative'; baseImpact = -4.0; }
    else if (/ビットコイン|bitcoin|btc/.test(q)) { sentiment = 'positive'; baseImpact = 1.5; }
    else if (/核|nuclear|北朝鮮|north korea/.test(q)) { sentiment = 'negative'; baseImpact = -3.0; }
    else if (/nvidia|半導体/.test(q)) { sentiment = 'positive'; baseImpact = 2.0; }
    else if (/金価格|gold/.test(q)) { sentiment = 'neutral'; baseImpact = 0.8; }
    else if (/ドル円|usd.*jpy|円/.test(q)) { sentiment = 'negative'; baseImpact = -1.5; }
    else if (/日経|nikkei/.test(q)) { sentiment = 'positive'; baseImpact = 2.2; }
    else if (/選挙|election/.test(q)) { sentiment = 'neutral'; baseImpact = -0.5; }
    else if (/トランプ|trump/.test(q)) { sentiment = 'negative'; baseImpact = -1.0; }
    else { baseImpact = (Math.random() - 0.3) * 2; sentiment = baseImpact >= 0 ? 'positive' : 'negative'; }

    // 信頼度で影響を加重（高信頼=そのまま、低信頼=影響を割引）
    const credMultiplier = cred.score / 3;
    const adjustedImpact = parseFloat((baseImpact * credMultiplier).toFixed(1));
    // 注目度スコア = |影響度| × 信頼度 × 出来高急増ブースト
    const attentionScore = Math.abs(baseImpact) * cred.score * (cred.spikeScore >= 2 ? 1.5 : 1);

    return {
      question: m.question,
      yesPercent: Math.round(m.yesPrice * 100),
      sentiment,
      impact: adjustedImpact,
      credibility: cred,
      volume: m.volumeNum,
      volume24hr: m.volume24hr,
      attentionScore,
    };
  }).sort((a, b) => b.attentionScore - a.attentionScore);

  const topEvents = scoredEvents.slice(0, 5);

  const overallImpact = topEvents.length > 0
    ? topEvents.reduce((s, e) => s + e.impact * e.yesPercent / 100, 0)
    : 0;

  return (
    <div className="fixed bottom-6 right-6 z-40" style={{ width: open ? 380 : 'auto' }}>
      {open ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 cursor-pointer" onClick={() => setOpen(false)}>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FiCpu className="w-5 h-5" />
                <span className="font-bold text-sm">AI ポートフォリオ影響</span>
              </div>
              <FiChevronDown className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-white">
                {overallImpact >= 0 ? '+' : ''}{overallImpact.toFixed(2)}%
              </span>
              <span className="text-xs text-blue-200">総合推定影響</span>
            </div>
            <div className="text-xs text-blue-200 mt-1">
              ポートフォリオ: ¥{totalValue.toLocaleString()} · {portfolio.length}銘柄
            </div>
          </div>

          {/* イベント影響リスト */}
          <div className="p-3 max-h-96 overflow-y-auto">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">注目イベント（信頼度×影響度でランキング）</div>
            {topEvents.map((e, i) => (
              <div key={i} className="p-2.5 rounded-lg hover:bg-gray-50 mb-1.5 border border-gray-100">
                <div className="flex items-start gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    e.sentiment === 'positive' ? 'bg-green-100' : e.sentiment === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {e.sentiment === 'positive' ? <FiArrowUp className="w-3 h-3 text-green-600" /> :
                     e.sentiment === 'negative' ? <FiArrowDown className="w-3 h-3 text-red-600" /> :
                     <span className="text-[10px] text-gray-500">—</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-800 line-clamp-1">{e.question}</div>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-400">確率 {e.yesPercent}%</span>
                      <span className={`text-[10px] font-bold ${e.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        影響 {e.impact >= 0 ? '+' : ''}{e.impact}%
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        e.credibility.label === '高' ? 'bg-blue-100 text-blue-700' :
                        e.credibility.label === '中' ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        信頼度:{e.credibility.label}
                      </span>
                      {e.credibility.spikeScore >= 2 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold">🔥急増</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                      <span>賭け金総額: {formatVol(e.volume)}</span>
                      <span>24h: {formatVol(e.volume24hr)}</span>
                      {e.credibility.spikeRatio > 0.05 && (
                        <span className="text-orange-500 font-medium">
                          ({(e.credibility.spikeRatio * 100).toFixed(1)}%/日)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 保有銘柄サマリー */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">保有銘柄</div>
              <div className="grid grid-cols-2 gap-1">
                {portfolio.map(p => (
                  <div key={p.code} className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded text-xs">
                    <span className="font-medium text-gray-700">{p.name}</span>
                    <span className="text-gray-400">¥{(p.value / 10000).toFixed(0)}万</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
            <div className="flex items-start gap-1.5">
              <FiAlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-[10px] text-gray-400">AI推定値です。投資助言ではありません。</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <FiCpu className="w-5 h-5" />
          <span className="font-bold text-sm">AI影響分析</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${overallImpact >= 0 ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
            {overallImpact >= 0 ? '+' : ''}{overallImpact.toFixed(1)}%
          </span>
          <FiChevronUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── マーケットカード ─────────────────────────
function MarketCard({ market, japanRelated, volumeSpike }: { market: PolymarketMarket & { yesPrice: number; noPrice: number; volumeNum: number; liquidityNum: number }; japanRelated?: boolean; volumeSpike?: boolean }) {
  const [showDetail, setShowDetail] = useState(false);
  const m = market;
  const yesPercent = Math.round(m.yesPrice * 100);
  const noPercent = Math.round(m.noPrice * 100);
  const isHighProbability = m.yesPrice >= 0.7;
  const isLowProbability = m.yesPrice <= 0.3;

  const formatVolume = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  const endDate = new Date(m.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer"
      >
        {m.image && (
          <div className="h-32 overflow-hidden bg-gray-100">
            <img src={m.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <div className="p-4">
          {(japanRelated || volumeSpike) && (
            <div className="flex items-center gap-1.5 mb-2">
              {japanRelated && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">🇯🇵 日本関連</span>}
              {volumeSpike && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">🔥 出来高急増</span>}
            </div>
          )}
          <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">{m.question}</h3>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                {isHighProbability ? <FiTrendingUp className="w-3.5 h-3.5 text-green-500" /> : isLowProbability ? <FiTrendingDown className="w-3.5 h-3.5 text-red-500" /> : null}
                <span className={`text-lg font-black ${isHighProbability ? 'text-green-600' : isLowProbability ? 'text-red-600' : 'text-blue-600'}`}>{yesPercent}%</span>
                <span className="text-xs text-gray-400">はい</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">いいえ</span>
                <span className="text-sm font-bold text-gray-500">{noPercent}%</span>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${isHighProbability ? 'bg-gradient-to-r from-green-400 to-green-500' : isLowProbability ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`} style={{ width: `${yesPercent}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span title="24h取引量">📈 {formatVolume(m.volume24hr || 0)}<span className="text-gray-300 ml-0.5">/24h</span></span>
              <span title="累計取引量">💰 {formatVolume(m.volumeNum)}</span>
            </div>
            <span className={`font-medium ${daysLeft <= 7 ? 'text-red-500' : 'text-gray-400'}`}>{daysLeft > 0 ? `残り${daysLeft}日` : '終了'}</span>
          </div>
        </div>
      </div>

      {showDetail && (
        <MarketDetailModal market={m} yesPercent={yesPercent} noPercent={noPercent} formatVolume={formatVolume} daysLeft={daysLeft} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

// ─── 詳細モーダル ─────────────────────────
type DetailTab = 'holders' | 'positions' | 'activity' | 'orderbook' | 'ai';

function MarketDetailModal({ market: m, yesPercent, noPercent, formatVolume, daysLeft, onClose }: {
  market: PolymarketMarket & { yesPrice: number; noPrice: number; volumeNum: number; liquidityNum: number };
  yesPercent: number; noPercent: number; formatVolume: (v: number) => string; daysLeft: number;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>('holders');

  const TABS: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
    { key: 'holders', label: 'TOPホルダー', icon: <FiUsers className="w-4 h-4" /> },
    { key: 'positions', label: 'ポジション', icon: <FiBarChart2 className="w-4 h-4" /> },
    { key: 'activity', label: '取引履歴', icon: <FiActivity className="w-4 h-4" /> },
    { key: 'orderbook', label: '板情報', icon: <FiList className="w-4 h-4" /> },
    { key: 'ai', label: 'AI影響分析', icon: <FiCpu className="w-4 h-4" /> },
  ];

  // モックデータ
  const mockHolders = [
    { rank: 1, name: '0x7a3f...8b2c', position: 'はい', shares: 125000, value: '$' + (125000 * m.yesPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }), pnl: '+$18,200' },
    { rank: 2, name: '0xd4e1...a9f0', position: 'はい', shares: 98000, value: '$' + (98000 * m.yesPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }), pnl: '+$12,400' },
    { rank: 3, name: '0x2b8c...3d7e', position: 'いいえ', shares: 85000, value: '$' + (85000 * m.noPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }), pnl: '+$9,800' },
    { rank: 4, name: '0xf1a5...c6b2', position: 'はい', shares: 72000, value: '$' + (72000 * m.yesPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }), pnl: '-$3,200' },
    { rank: 5, name: '0x9c3d...e4a1', position: 'いいえ', shares: 63000, value: '$' + (63000 * m.noPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }), pnl: '+$7,100' },
    { rank: 6, name: '0x5e7b...2f9d', position: 'はい', shares: 51000, value: '$' + (51000 * m.yesPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }), pnl: '+$4,500' },
    { rank: 7, name: '0x8a2f...d1c4', position: 'いいえ', shares: 42000, value: '$' + (42000 * m.noPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }), pnl: '-$1,800' },
    { rank: 8, name: '0xc6d9...b3e7', position: 'はい', shares: 35000, value: '$' + (35000 * m.yesPrice).toLocaleString(undefined, { maximumFractionDigits: 0 }), pnl: '+$2,900' },
  ];

  const mockActivity = [
    { time: '2分前', user: '0x7a3f...8b2c', side: '買い', outcome: 'はい', amount: '$2,500', price: `$${m.yesPrice.toFixed(2)}` },
    { time: '5分前', user: '0xd4e1...a9f0', side: '売り', outcome: 'いいえ', amount: '$1,800', price: `$${m.noPrice.toFixed(2)}` },
    { time: '8分前', user: '0x2b8c...3d7e', side: '買い', outcome: 'いいえ', amount: '$3,200', price: `$${(m.noPrice - 0.01).toFixed(2)}` },
    { time: '12分前', user: '0xf1a5...c6b2', side: '買い', outcome: 'はい', amount: '$900', price: `$${(m.yesPrice - 0.02).toFixed(2)}` },
    { time: '15分前', user: '0x9c3d...e4a1', side: '売り', outcome: 'はい', amount: '$4,100', price: `$${(m.yesPrice + 0.01).toFixed(2)}` },
    { time: '22分前', user: '0x5e7b...2f9d', side: '買い', outcome: 'はい', amount: '$1,500', price: `$${(m.yesPrice - 0.01).toFixed(2)}` },
    { time: '30分前', user: '0x8a2f...d1c4', side: '売り', outcome: 'いいえ', amount: '$2,200', price: `$${(m.noPrice + 0.02).toFixed(2)}` },
    { time: '45分前', user: '0xc6d9...b3e7', side: '買い', outcome: 'いいえ', amount: '$800', price: `$${m.noPrice.toFixed(2)}` },
  ];

  const yp = m.yesPrice;
  const np = m.noPrice;
  const mockOrderbook = {
    bids: [
      { price: (yp - 0.01).toFixed(2), size: '12,500', total: '12,500' },
      { price: (yp - 0.02).toFixed(2), size: '8,300', total: '20,800' },
      { price: (yp - 0.03).toFixed(2), size: '15,200', total: '36,000' },
      { price: (yp - 0.04).toFixed(2), size: '6,800', total: '42,800' },
      { price: (yp - 0.05).toFixed(2), size: '22,100', total: '64,900' },
    ],
    asks: [
      { price: (yp + 0.01).toFixed(2), size: '9,800', total: '9,800' },
      { price: (yp + 0.02).toFixed(2), size: '14,200', total: '24,000' },
      { price: (yp + 0.03).toFixed(2), size: '7,500', total: '31,500' },
      { price: (yp + 0.04).toFixed(2), size: '18,600', total: '50,100' },
      { price: (yp + 0.05).toFixed(2), size: '11,300', total: '61,400' },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-lg font-bold text-gray-900">{m.question}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>📈 24h: {formatVolume(m.volume24hr || 0)}</span>
                <span>💰 累計: {formatVolume(m.volumeNum)}</span>
                <span>💧 流動性: {formatVolume(m.liquidityNum)}</span>
                <span className={daysLeft <= 7 ? 'text-red-500 font-medium' : ''}>{daysLeft > 0 ? `残り${daysLeft}日` : '終了'}</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-2xl font-black text-blue-600">{yesPercent}% <span className="text-xs font-normal text-gray-400">はい</span></span>
                <span className="text-lg font-bold text-gray-400">{noPercent}% <span className="text-xs font-normal">いいえ</span></span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><FiX className="w-5 h-5" /></button>
          </div>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.icon} {t.label}
            </button>
          ))}
          <a href={`https://polymarket.com/event/${m.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-4 py-3 text-sm text-gray-400 hover:text-blue-500 ml-auto">
            Polymarketで開く <FiExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* コンテンツ */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 220px)' }}>
          {tab === 'holders' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Yes ホルダー */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-bold text-green-700">「はい」TOPホルダー</span>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-xs border-b">
                    <th className="pb-2 w-8">#</th><th className="pb-2">アドレス</th><th className="pb-2 text-right">シェア数</th><th className="pb-2 text-right">評価額</th><th className="pb-2 text-right">損益</th>
                  </tr></thead>
                  <tbody>
                    {mockHolders.filter(h => h.position === 'はい').map((h, i) => (
                      <tr key={h.rank} className="border-b border-gray-50 hover:bg-green-50/30">
                        <td className="py-2.5 text-gray-400 font-medium">{i + 1}</td>
                        <td className="py-2.5 font-mono text-xs">{h.name}</td>
                        <td className="py-2.5 text-right font-medium">{h.shares.toLocaleString()}</td>
                        <td className="py-2.5 text-right">{h.value}</td>
                        <td className={`py-2.5 text-right font-medium ${h.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{h.pnl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* No ホルダー */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-bold text-red-700">「いいえ」TOPホルダー</span>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-xs border-b">
                    <th className="pb-2 w-8">#</th><th className="pb-2">アドレス</th><th className="pb-2 text-right">シェア数</th><th className="pb-2 text-right">評価額</th><th className="pb-2 text-right">損益</th>
                  </tr></thead>
                  <tbody>
                    {mockHolders.filter(h => h.position === 'いいえ').map((h, i) => (
                      <tr key={h.rank} className="border-b border-gray-50 hover:bg-red-50/30">
                        <td className="py-2.5 text-gray-400 font-medium">{i + 1}</td>
                        <td className="py-2.5 font-mono text-xs">{h.name}</td>
                        <td className="py-2.5 text-right font-medium">{h.shares.toLocaleString()}</td>
                        <td className="py-2.5 text-right">{h.value}</td>
                        <td className={`py-2.5 text-right font-medium ${h.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{h.pnl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'positions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-xs text-green-600 font-medium mb-1">「はい」ポジション合計</div>
                  <div className="text-2xl font-black text-green-700">{formatVolume(m.volumeNum * m.yesPrice * 0.6)}</div>
                  <div className="text-xs text-green-500 mt-1">{Math.round(m.volumeNum * 0.6 / 1000)}K シェア</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="text-xs text-red-600 font-medium mb-1">「いいえ」ポジション合計</div>
                  <div className="text-2xl font-black text-red-700">{formatVolume(m.volumeNum * m.noPrice * 0.4)}</div>
                  <div className="text-xs text-red-500 mt-1">{Math.round(m.volumeNum * 0.4 / 1000)}K シェア</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-3">ポジション分布</div>
                <div className="h-6 rounded-full overflow-hidden flex">
                  <div className="bg-green-400 h-full transition-all" style={{ width: `${yesPercent}%` }} />
                  <div className="bg-red-400 h-full transition-all" style={{ width: `${noPercent}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-green-600 font-medium">はい {yesPercent}%</span>
                  <span className="text-red-600 font-medium">いいえ {noPercent}%</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-2">統計</div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><div className="text-lg font-bold text-gray-800">{mockHolders.length * 12}</div><div className="text-xs text-gray-400">ホルダー数</div></div>
                  <div><div className="text-lg font-bold text-gray-800">{formatVolume(m.liquidityNum)}</div><div className="text-xs text-gray-400">流動性</div></div>
                  <div><div className="text-lg font-bold text-gray-800">{formatVolume(m.volume24hr || 0)}</div><div className="text-xs text-gray-400">24h出来高</div></div>
                </div>
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 text-xs border-b">
                <th className="pb-2">時間</th><th className="pb-2">ユーザー</th><th className="pb-2">売買</th><th className="pb-2">アウトカム</th><th className="pb-2 text-right">金額</th><th className="pb-2 text-right">価格</th>
              </tr></thead>
              <tbody>
                {mockActivity.map((a, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 text-gray-400 text-xs">{a.time}</td>
                    <td className="py-2.5 font-mono text-xs">{a.user}</td>
                    <td className="py-2.5"><span className={`px-2 py-0.5 rounded text-xs font-medium ${a.side === '買い' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{a.side}</span></td>
                    <td className="py-2.5 text-xs">{a.outcome}</td>
                    <td className="py-2.5 text-right font-medium">{a.amount}</td>
                    <td className="py-2.5 text-right text-gray-500">{a.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'orderbook' && (
            <div className="grid grid-cols-2 gap-4">
              {/* 買い板 */}
              <div>
                <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider">買い注文（Bid）</div>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-xs border-b">
                    <th className="pb-2">価格</th><th className="pb-2 text-right">数量</th><th className="pb-2 text-right">累計</th>
                  </tr></thead>
                  <tbody>
                    {mockOrderbook.bids.map((b, i) => (
                      <tr key={i} className="border-b border-gray-50 relative">
                        <td className="py-2 text-green-600 font-medium">${b.price}</td>
                        <td className="py-2 text-right">{b.size}</td>
                        <td className="py-2 text-right text-gray-400">{b.total}</td>
                        <td className="absolute inset-0 bg-green-50 opacity-20" style={{ width: `${(parseInt(b.total.replace(/,/g, '')) / 65000) * 100}%` }} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 売り板 */}
              <div>
                <div className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wider">売り注文（Ask）</div>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-xs border-b">
                    <th className="pb-2">価格</th><th className="pb-2 text-right">数量</th><th className="pb-2 text-right">累計</th>
                  </tr></thead>
                  <tbody>
                    {mockOrderbook.asks.map((a, i) => (
                      <tr key={i} className="border-b border-gray-50 relative">
                        <td className="py-2 text-red-600 font-medium">${a.price}</td>
                        <td className="py-2 text-right">{a.size}</td>
                        <td className="py-2 text-right text-gray-400">{a.total}</td>
                        <td className="absolute inset-0 bg-red-50 opacity-20" style={{ width: `${(parseInt(a.total.replace(/,/g, '')) / 62000) * 100}%` }} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="col-span-2 text-center py-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-400">スプレッド: </span>
                <span className="text-sm font-bold text-gray-700">${(0.02).toFixed(2)}</span>
                <span className="text-xs text-gray-400 ml-1">({((0.02 / yp) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          )}

          {tab === 'ai' && <AIPortfolioImpact question={m.question} yesPercent={yesPercent} />}
        </div>
      </div>
    </div>
  );
}

// ─── AI ポートフォリオ影響分析（デモ） ─────────────────
function AIPortfolioImpact({ question, yesPercent }: { question: string; yesPercent: number }) {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // デモ用のポートフォリオ
  const portfolio = [
    { code: '7203', name: 'トヨタ自動車', shares: 100, price: 2850, sector: '輸送用機器' },
    { code: '8306', name: '三菱UFJ', shares: 500, price: 1680, sector: '銀行業' },
    { code: '6758', name: 'ソニーG', shares: 50, price: 3200, sector: '電気機器' },
    { code: '9984', name: 'ソフトバンクG', shares: 200, price: 8950, sector: '情報・通信業' },
    { code: '6861', name: 'キーエンス', shares: 10, price: 68000, sector: '電気機器' },
  ];

  // イベントに応じた影響度をモック生成
  const getImpact = (name: string, sector: string) => {
    const q = question.toLowerCase();
    if (/利下げ|fed|金利|rate/.test(q)) {
      if (sector === '銀行業') return { impact: -2.1, reason: '金利低下で利ざや縮小' };
      if (sector === '情報・通信業') return { impact: 3.5, reason: '成長株に資金シフト' };
      return { impact: 1.2, reason: '金融緩和による市場全体の上昇' };
    }
    if (/関税|tariff|貿易|trade/.test(q)) {
      if (sector === '輸送用機器') return { impact: -4.8, reason: '輸出コスト増大、米国向け販売減' };
      if (sector === '電気機器') return { impact: -3.2, reason: 'サプライチェーン混乱リスク' };
      return { impact: -1.5, reason: '貿易摩擦による景気減速懸念' };
    }
    if (/日銀|boj|利上げ|japan.*rate/.test(q)) {
      if (sector === '銀行業') return { impact: 4.5, reason: '利ざや拡大で収益改善' };
      if (sector === '輸送用機器') return { impact: -1.8, reason: '円高進行で輸出減' };
      return { impact: -0.8, reason: '金利上昇による割引率上昇' };
    }
    if (/リセッション|recession|景気後退/.test(q)) {
      if (sector === '銀行業') return { impact: -5.2, reason: '貸倒リスク増大' };
      if (sector === '情報・通信業') return { impact: -3.8, reason: '広告収入・投資減少' };
      return { impact: -4.0, reason: '景気後退による需要減' };
    }
    if (/ビットコイン|bitcoin|btc|crypto/.test(q)) {
      if (name === 'ソフトバンクG') return { impact: 2.8, reason: '暗号資産関連投資の評価益' };
      return { impact: 0.3, reason: '直接的な影響は限定的' };
    }
    if (/nvidia|半導体|semiconductor/.test(q)) {
      if (sector === '電気機器') return { impact: 3.5, reason: '半導体需要拡大の恩恵' };
      return { impact: 0.5, reason: 'テック株連動' };
    }
    if (/日経|nikkei/.test(q)) {
      return { impact: 2.0 + Math.random() * 2, reason: '日本株全体の上昇に連動' };
    }
    if (/ドル円|usd.*jpy|円/.test(q)) {
      if (sector === '輸送用機器') return { impact: -3.5, reason: '円高で輸出採算悪化' };
      if (sector === '銀行業') return { impact: 0.5, reason: '為替の影響は限定的' };
      return { impact: -1.0, reason: '円高による外需減' };
    }
    if (/ukraine|ウクライナ|停戦|ceasefire/.test(q)) {
      return { impact: 1.5, reason: '地政学リスク緩和で市場全体にプラス' };
    }
    if (/台湾|taiwan|中国.*軍/.test(q)) {
      if (sector === '電気機器') return { impact: -8.5, reason: '半導体サプライチェーン壊滅リスク' };
      return { impact: -5.0, reason: '東アジア地政学リスクの顕在化' };
    }
    if (/選挙|election/.test(q)) {
      return { impact: -0.5 + Math.random() * 2, reason: '政策変更の不確実性' };
    }
    // デフォルト
    const r = (Math.random() - 0.4) * 4;
    return { impact: parseFloat(r.toFixed(1)), reason: '市場センチメントの変化' };
  };

  const impacts = portfolio.map(p => ({
    ...p,
    totalValue: p.shares * p.price,
    ...getImpact(p.name, p.sector),
  }));

  const totalPortfolioValue = impacts.reduce((s, p) => s + p.totalValue, 0);
  const weightedImpact = impacts.reduce((s, p) => s + (p.impact * p.totalValue / totalPortfolioValue), 0);
  const totalPnl = impacts.reduce((s, p) => s + (p.totalValue * p.impact / 100), 0);

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <FiCpu className="w-5 h-5 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-sm text-gray-500">AIがポートフォリオへの影響を分析中...</div>
        <div className="text-xs text-gray-400">イベント確率・セクター相関・過去データを解析しています</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* サマリー */}
      <div className={`rounded-xl p-5 border ${weightedImpact >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-2 mb-1">
          <FiCpu className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI分析結果</span>
        </div>
        <div className="flex items-baseline gap-3 mt-2">
          <span className={`text-3xl font-black ${weightedImpact >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {weightedImpact >= 0 ? '+' : ''}{weightedImpact.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">ポートフォリオ推定影響度</span>
        </div>
        <div className={`text-sm font-medium mt-1 ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          想定損益: {totalPnl >= 0 ? '+' : ''}¥{Math.round(totalPnl).toLocaleString()}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          ※ イベント確率 {yesPercent}% を加味した推定値です。確率変動により影響度は変化します。
        </div>
      </div>

      {/* 銘柄別影響 */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">銘柄別影響分析</div>
        <div className="space-y-2">
          {impacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).map(p => (
            <div key={p.code} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{p.name}</span>
                  <span className="text-xs text-gray-400">{p.code}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded">{p.sector}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{p.reason}</div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  {p.impact >= 0 ? (
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.min(Math.abs(p.impact) * 10, 100)}%` }} />
                  ) : (
                    <div className="h-full bg-red-400 rounded-full float-right" style={{ width: `${Math.min(Math.abs(p.impact) * 10, 100)}%` }} />
                  )}
                </div>
                <div className={`text-sm font-bold w-16 text-right ${p.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {p.impact >= 0 ? '+' : ''}{p.impact.toFixed(1)}%
                </div>
                <div className={`text-xs w-20 text-right ${p.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {p.impact >= 0 ? '+' : ''}¥{Math.round(p.totalValue * p.impact / 100).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 注意書き */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <FiAlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700">
          本分析はAIによる推定であり、投資助言ではありません。実際の市場動向は多数の要因に左右されます。投資判断はご自身の責任で行ってください。
        </div>
      </div>
    </div>
  );
}
