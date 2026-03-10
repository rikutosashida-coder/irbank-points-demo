/**
 * 企業財務データAPI（モック実装）
 * 実際のIRBANK APIに接続する際はこのファイルを更新
 */

import {
  CompanyFinancials,
  CompanySummary,
  CompanyProfile,
  AnnualResult,
  QuarterlyResult,
  BalanceSheet,
  CashFlow,
  DividendData,
  StockPricePoint,
  BusinessSegment,
  Shareholder,
  EarningsForecast,
  ShikihoCommentary,
  MetricsDashboard,
  PerShareMetrics,
  FiscalYearDetail,
  PLLineItem,
  BSLineItem,
  CFLineItem,
  CompanyInfoData,
  Director,
  DirectorCompensation,
  HighPaidDirector,
  AuditFee,
  EmployeeSegment,
  EmployeeTrend,
  SalaryTrend,
  DebtRepaymentSchedule,
  AssetLiabilityItem,
  Subsidiary,
  ShareholderReturn,
  ShareIssuance,
  LargeHolding,
  LargeHoldingTarget,
  ShareBuyback,
  StockLending,
  MajorCustomer,
  BusinessPartner,
  ShareholderBenefit,
  CompanyHistoryEvent,
  CompanyNews,
  MarginData,
  ShortSellingRecord,
  MarginTradingRecord,
  LendingJsdaRecord,
  ReverseDailyRecord,
  JsfRecord,
  SupplyDemandAnalysis,
  IrDisclosureData,
  DisclosureDocument,
  FilingScheduleRow,
  TanshinEarnings,
  EarningsRevision,
  YuhoDetailItem,
  AccountItem,
  IFRSSummaryRow,
  YuhoSection,
  YuhoNoteBlock,
  ValuationHistory,
} from '../../features/company/types/financials.types';

// ============================================
// 銘柄プロファイル（決定論的なモックデータ生成用）
// ============================================

interface StockProfile {
  name: string;
  edinetCode: string;
  /** 有報PDF URLテンプレート。{year} を決算年度（例: 2024）に置換する */
  yuhoUrlTemplate: string;
  market: 'Prime' | 'Standard' | 'Growth';
  sector: string;
  industry: string;
  baseRevenue: number;
  growthRate: number;
  operatingMargin: number;
  equityRatio: number;
  dividendPayout: number;
  perRange: number;
  sharesOutstanding: number;
  // 企業概要
  description: string;
  mission: string;
  vision: string;
  industryPosition: string;
  founded: string;
  headquarters: string;
  ceo: string;
  url: string;
  listingDate: string;
  // セグメント
  segmentNames: string[];
  segmentWeights: number[];
  // 四季報コメント
  commentHeadline: string;
  commentBody: string;
  commentOutlook: 'positive' | 'neutral' | 'cautious';
}

const STOCK_PROFILES: Record<string, StockProfile> = {
  '7203': {
    name: 'トヨタ自動車', edinetCode: 'E02144', yuhoUrlTemplate: 'https://global.toyota/pages/global_toyota/ir/library/securities-report/archives/archives_{year}_03.pdf', market: 'Prime', sector: '輸送用機器', industry: '自動車',
    baseRevenue: 30000000, growthRate: 0.05, operatingMargin: 0.08,
    equityRatio: 0.38, dividendPayout: 0.30, perRange: 10, sharesOutstanding: 14000,
    description: '世界最大級の自動車メーカー。トヨタ・レクサスブランドで乗用車・商用車を製造販売。EV・水素燃料電池車など次世代技術にも注力。ダイハツ、日野自動車を傘下に持つ。',
    mission: '幸せを量産する',
    vision: 'モビリティカンパニーへ変革し、すべての人に移動の自由と楽しさを提供する',
    industryPosition: '世界販売台数トップクラス。HV技術で先行し、EV・水素FCVにも全方位展開',
    founded: '1937年8月', headquarters: '愛知県豊田市', ceo: '佐藤恒治', url: 'https://global.toyota/jp/', listingDate: '1949年5月',
    segmentNames: ['自動車', '金融', 'その他'], segmentWeights: [0.90, 0.07, 0.03],
    commentHeadline: '【連続最高益】', commentBody: '北米・アジアでの販売好調が続く。円安効果も寄与し営業利益は過去最高を更新。EV戦略の加速に伴う研究開発費増加は織り込み済み。HV需要の底堅さも追い風。', commentOutlook: 'positive',
  },
  '6758': {
    name: 'ソニーグループ', edinetCode: 'E01777', yuhoUrlTemplate: 'https://www.sony.com/ja/SonyInfo/IR/library/yuho.html', market: 'Prime', sector: '電気機器', industry: 'エレクトロニクス',
    baseRevenue: 10000000, growthRate: 0.08, operatingMargin: 0.10,
    equityRatio: 0.25, dividendPayout: 0.10, perRange: 15, sharesOutstanding: 1260,
    description: 'ゲーム（PlayStation）・音楽・映画・半導体（イメージセンサー）を柱とするエンタメ・テクノロジー複合企業。CMOSイメージセンサーで世界シェア首位。',
    mission: 'クリエイティビティとテクノロジーの力で、世界を感動で満たす',
    vision: '人の心を動かす感動体験の創出を通じ、クリエイターとユーザーを世界中でつなぐ',
    industryPosition: 'エンタメ×テクノロジーの融合型企業。CMOSイメージセンサー世界シェア1位',
    founded: '1946年5月', headquarters: '東京都港区', ceo: '十時裕樹', url: 'https://www.sony.com/ja/', listingDate: '1958年12月',
    segmentNames: ['ゲーム&ネットワーク', '音楽', '映画', 'イメージング&センシング', '金融', 'その他'], segmentWeights: [0.30, 0.15, 0.13, 0.15, 0.20, 0.07],
    commentHeadline: '【増益基調】', commentBody: 'ゲーム事業がPS5のサブスクリプション収入増加で安定成長。イメージセンサーはスマートフォン高画素化の恩恵。映画・音楽のIPビジネスが収益の柱に成長。', commentOutlook: 'positive',
  },
  '9984': {
    name: 'ソフトバンクグループ', edinetCode: 'E02778', yuhoUrlTemplate: 'https://group.softbank/en/ir/financials', market: 'Prime', sector: '情報・通信業', industry: '通信',
    baseRevenue: 6000000, growthRate: 0.10, operatingMargin: 0.20,
    equityRatio: 0.15, dividendPayout: 0.05, perRange: 20, sharesOutstanding: 1480,
    description: '投資持株会社。ビジョンファンドを通じてAI・テクノロジー企業へ大規模投資。傘下にArm Holdings、ソフトバンク（通信）。AI革命を推進。',
    mission: '情報革命で人々を幸せに',
    vision: 'AI群戦略で300年成長する企業グループを構築する',
    industryPosition: '世界最大級のテクノロジー投資会社。Arm・AI関連投資先を多数保有',
    founded: '1981年9月', headquarters: '東京都港区', ceo: '孫正義', url: 'https://group.softbank/', listingDate: '1994年7月',
    segmentNames: ['ソフトバンク（通信）', 'Arm', 'ビジョンファンド', 'その他'], segmentWeights: [0.55, 0.05, 0.30, 0.10],
    commentHeadline: '【AI投資加速】', commentBody: 'Arm上場後の含み益が拡大。AI関連投資先の評価額上昇でファンド事業回復。通信子会社の安定収益が下支え。純有利子負債の改善が課題。', commentOutlook: 'neutral',
  },
  '6861': {
    name: 'キーエンス', edinetCode: 'E01981', yuhoUrlTemplate: 'https://www.keyence.co.jp/company/financial-info/', market: 'Prime', sector: '電気機器', industry: '精密機器',
    baseRevenue: 800000, growthRate: 0.12, operatingMargin: 0.52,
    equityRatio: 0.95, dividendPayout: 0.20, perRange: 45, sharesOutstanding: 243,
    description: 'FA用センサー・画像処理・計測機器の大手。直販体制による高い営業利益率が特徴。コンサルティング営業で顧客の生産性向上を提案。',
    mission: '新しい価値の創造を通じて社会に貢献する',
    vision: '世界中のものづくりの現場を革新し、顧客の付加価値最大化を追求する',
    industryPosition: 'FA用センサー世界トップクラス。営業利益率50%超の超高収益体質',
    founded: '1974年5月', headquarters: '大阪府大阪市', ceo: '中田有', url: 'https://www.keyence.co.jp/', listingDate: '1987年10月',
    segmentNames: ['ファクトリーオートメーション'], segmentWeights: [1.0],
    commentHeadline: '【高収益維持】', commentBody: '営業利益率50%超を継続。直販モデルによる価格決定力が強み。海外売上比率の拡大が成長ドライバー。新製品投入ペース加速で顧客接点拡大。', commentOutlook: 'positive',
  },
  '9983': {
    name: 'ファーストリテイリング', edinetCode: 'E03008', yuhoUrlTemplate: 'https://www.fastretailing.com/jp/ir/library/yuho.html', market: 'Prime', sector: '小売業', industry: 'アパレル',
    baseRevenue: 2400000, growthRate: 0.10, operatingMargin: 0.14,
    equityRatio: 0.50, dividendPayout: 0.35, perRange: 35, sharesOutstanding: 306,
    description: 'ユニクロ・GUを展開するSPA（製造小売）大手。LifeWearコンセプトのもと、グローバルに店舗展開。海外ユニクロ事業が成長の柱。',
    mission: '服を変え、常識を変え、世界を変えていく',
    vision: 'LifeWearで世界No.1のアパレル製造小売企業へ',
    industryPosition: '世界3位のアパレル企業。海外ユニクロが売上の半分超を占める成長エンジン',
    founded: '1963年5月', headquarters: '山口県山口市', ceo: '柳井正', url: 'https://www.fastretailing.com/jp/', listingDate: '1994年7月',
    segmentNames: ['国内ユニクロ', '海外ユニクロ', 'GU', 'その他'], segmentWeights: [0.35, 0.50, 0.10, 0.05],
    commentHeadline: '【海外好調】', commentBody: '海外ユニクロが東南アジア・欧州を中心に出店加速。粗利率改善と為替効果で増益基調。国内は成熟市場だが客単価上昇で底堅い。', commentOutlook: 'positive',
  },
  '9432': {
    name: '日本電信電話', edinetCode: 'E04430', yuhoUrlTemplate: 'https://group.ntt/jp/ir/library/yuho/', market: 'Prime', sector: '情報・通信業', industry: '通信',
    baseRevenue: 12000000, growthRate: 0.03, operatingMargin: 0.15,
    equityRatio: 0.35, dividendPayout: 0.40, perRange: 12, sharesOutstanding: 9060,
    description: 'NTTグループの持株会社。NTTドコモ、NTTデータ、NTT東西など傘下。IOWN構想で次世代通信基盤を推進。データセンター事業を強化中。',
    mission: 'Your Value Partner — 新しいコミュニケーション文化の世界の創造',
    vision: 'IOWN構想で光ベースの次世代通信インフラを実現し、限界を超えた情報社会を創る',
    industryPosition: '国内通信最大手。グローバルITサービスでも世界トップ10入り',
    founded: '1985年4月', headquarters: '東京都千代田区', ceo: '島田明', url: 'https://group.ntt/jp/', listingDate: '1987年2月',
    segmentNames: ['総合ICT', 'グローバル・ソリューション', '地域通信', 'その他'], segmentWeights: [0.40, 0.30, 0.25, 0.05],
    commentHeadline: '【堅実増配】', commentBody: 'ドコモの安定収益に加え、NTTデータの海外IT事業が成長。14期連続増配で株主還元姿勢鮮明。IOWN実用化に向けた先行投資が続く。', commentOutlook: 'neutral',
  },
  '8306': {
    name: '三菱UFJフィナンシャル・グループ', edinetCode: 'E03606', yuhoUrlTemplate: 'https://www.mufg.jp/ir/report/security_report/index.html', market: 'Prime', sector: '銀行業', industry: '銀行',
    baseRevenue: 7000000, growthRate: 0.03, operatingMargin: 0.25,
    equityRatio: 0.05, dividendPayout: 0.35, perRange: 10, sharesOutstanding: 12300,
    description: '国内最大の金融グループ。三菱UFJ銀行、三菱UFJ信託、三菱UFJモルガン・スタンレー証券等を傘下に持つ。海外展開に強み。',
    mission: '世界に選ばれる、信頼のグローバル金融グループ',
    vision: '社会課題の解決と持続的成長を両立し、あらゆるステークホルダーに価値を届ける',
    industryPosition: '国内最大の金融グループ。海外40カ国以上で事業展開、アジアに強固な基盤',
    founded: '2001年4月', headquarters: '東京都千代田区', ceo: '亀澤宏規', url: 'https://www.mufg.jp/', listingDate: '2001年4月',
    segmentNames: ['デジタルサービス', '法人・リテール', 'コーポレートバンキング', 'グローバル', '市場', 'その他'], segmentWeights: [0.15, 0.20, 0.15, 0.30, 0.15, 0.05],
    commentHeadline: '【金利上昇恩恵】', commentBody: '日銀の金融政策正常化で利ざや改善が本格化。海外事業の収益貢献が拡大。自社株買い・増配で総還元性向50%超。政策保有株式の売却も進む。', commentOutlook: 'positive',
  },
  '6098': {
    name: 'リクルートホールディングス', edinetCode: 'E05765', yuhoUrlTemplate: 'https://recruit-holdings.co.jp/ir/library/securities-report.html', market: 'Prime', sector: 'サービス業', industry: '人材',
    baseRevenue: 3000000, growthRate: 0.08, operatingMargin: 0.12,
    equityRatio: 0.55, dividendPayout: 0.30, perRange: 25, sharesOutstanding: 1630,
    description: '人材マッチングプラットフォーム最大手。Indeed・Glassdoorで世界のHRテック市場をリード。じゃらん・ホットペッパー等の国内メディア事業も展開。',
    mission: 'まだ、ここにない出会い。（Follow Your Heart）',
    vision: 'テクノロジーの力で世界中の「人と仕事」「人とサービス」のマッチングを最適化する',
    industryPosition: '世界最大の求人検索エンジンIndeedを保有。HRテック分野で世界首位級',
    founded: '1963年8月', headquarters: '東京都千代田区', ceo: '出木場久征', url: 'https://recruit-holdings.co.jp/', listingDate: '2014年10月',
    segmentNames: ['HRテクノロジー', '人材派遣', 'マッチング&ソリューション'], segmentWeights: [0.45, 0.30, 0.25],
    commentHeadline: '【Indeed好調】', commentBody: 'Indeed の有料求人掲載が回復基調。HR テクノロジーのマッチング精度向上で顧客単価上昇。国内メディアはAI活用で効率化推進。', commentOutlook: 'positive',
  },
  '4063': {
    name: '信越化学工業', edinetCode: 'E00790', yuhoUrlTemplate: 'https://www.shinetsu.co.jp/jp/ir/ir-data/ir-securities/', market: 'Prime', sector: '化学', industry: '化学',
    baseRevenue: 2000000, growthRate: 0.08, operatingMargin: 0.33,
    equityRatio: 0.80, dividendPayout: 0.35, perRange: 20, sharesOutstanding: 410,
    description: '塩化ビニル樹脂・半導体シリコンウエハーで世界首位級。無借金経営で財務基盤が極めて堅固。シリコーン・レアアース磁石等も展開。',
    mission: '素材の可能性を追求し、豊かな社会づくりに貢献する',
    vision: '塩ビ・半導体シリコンの両輪でグローバルに不可欠な素材供給企業であり続ける',
    industryPosition: '半導体シリコンウエハー世界首位、塩ビ樹脂世界首位級。実質無借金経営',
    founded: '1926年9月', headquarters: '東京都千代田区', ceo: '斉藤恭彦', url: 'https://www.shinetsu.co.jp/', listingDate: '1949年5月',
    segmentNames: ['塩ビ・化成品', '半導体シリコン', 'シリコーン', '機能性化学品', 'その他'], segmentWeights: [0.35, 0.30, 0.15, 0.12, 0.08],
    commentHeadline: '【半導体回復】', commentBody: 'シリコンウエハー需要が半導体市況回復で持ち直し。塩ビ事業は米国の住宅着工回復が追い風。高い利益率と無借金経営で財務安定。', commentOutlook: 'positive',
  },
  '6367': {
    name: 'ダイキン工業', edinetCode: 'E01734', yuhoUrlTemplate: 'https://www.daikin.co.jp/investor/library/securities', market: 'Prime', sector: '機械', industry: '空調',
    baseRevenue: 3500000, growthRate: 0.06, operatingMargin: 0.10,
    equityRatio: 0.45, dividendPayout: 0.30, perRange: 25, sharesOutstanding: 293,
    description: '空調機器の世界最大手。住宅用から業務用まで幅広い製品ラインナップ。環境対応冷媒技術に強み。M&Aで北米・アジア市場を開拓。',
    mission: '空気で答えを出す会社',
    vision: '環境とエアマネジメントの技術で、世界中の人々に快適な空間を届ける',
    industryPosition: '空調機器世界シェア1位。190カ国以上で事業展開、環境冷媒技術に優位性',
    founded: '1924年10月', headquarters: '大阪府大阪市', ceo: '十河政則', url: 'https://www.daikin.co.jp/', listingDate: '1951年5月',
    segmentNames: ['空調・冷凍機', '化学', 'その他'], segmentWeights: [0.88, 0.08, 0.04],
    commentHeadline: '【世界需要堅調】', commentBody: 'アジア・欧州での空調需要増加が業績を牽引。環境規制強化による冷媒転換需要も追い風。北米は住宅市場の回復待ち。原材料高は価格転嫁で対応。', commentOutlook: 'neutral',
  },
};

const FISCAL_YEARS = Array.from({ length: 35 }, (_, i) => `${1990 + i}/3`);
// ['1990/3', '1991/3', ... , '2024/3']

// 決定論的な疑似乱数（seedベース）
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// 変動値を生成（-range〜+range）
function vary(base: number, range: number, seed: number): number {
  return base * (1 + (seededRandom(seed) - 0.5) * 2 * range);
}

/**
 * 企業財務データを取得（モック）
 */
export async function getCompanyFinancials(stockCode: string): Promise<CompanyFinancials | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const profile = STOCK_PROFILES[stockCode];
  if (!profile) return null;

  const annualResults = generateAnnualResults(stockCode, profile);
  const quarterlyResults = generateQuarterlyResults(stockCode, profile);
  const balanceSheets = generateBalanceSheets(stockCode, profile);
  const cashFlows = generateCashFlows(stockCode, profile);
  const dividends = generateDividends(stockCode, profile, annualResults, balanceSheets);
  const summary = generateSummary(stockCode, profile, annualResults, balanceSheets);
  const companyProfile = generateCompanyProfile(stockCode, profile);
  const stockPriceHistory = generateStockPriceHistory(stockCode, profile, summary);
  const segments = generateSegments(stockCode, profile, annualResults);
  const shareholders = generateShareholders(stockCode, profile);
  const forecast = generateForecast(stockCode, profile, annualResults);
  const commentary = generateCommentary(profile);
  const metricsDashboard = generateMetricsDashboard(stockCode, profile, annualResults, balanceSheets, cashFlows, summary);
  const perShareMetrics = generatePerShareMetrics(profile, annualResults, balanceSheets, cashFlows, dividends);
  const companyInfo = generateCompanyInfo(stockCode, profile, annualResults, balanceSheets, dividends, summary.currentPrice);
  const marginData = generateMarginData(stockCode, profile);
  const news = generateCompanyNews(stockCode, profile, annualResults);
  const irDisclosure = generateIrDisclosure(stockCode, profile, annualResults);
  const valuationHistory = generateValuationHistory(stockCode, profile, annualResults, balanceSheets, dividends);

  return {
    summary,
    profile: companyProfile,
    annualResults,
    quarterlyResults,
    balanceSheets,
    cashFlows,
    dividends,
    stockPriceHistory,
    segments,
    shareholders,
    forecast,
    commentary,
    metricsDashboard,
    perShareMetrics,
    companyInfo,
    marginData,
    news,
    irDisclosure,
    valuationHistory,
  };
}

// ============================================
// バリュエーション推移ジェネレータ
// ============================================

function generateValuationHistory(
  stockCode: string,
  profile: StockProfile,
  annualResults: AnnualResult[],
  balanceSheets: BalanceSheet[],
  dividends: DividendData[],
): ValuationHistory[] {
  return annualResults.map((ar, i) => {
    const bs = balanceSheets[i] || balanceSheets[balanceSheets.length - 1];
    const div = dividends[i] || dividends[dividends.length - 1];
    const eps = ar.eps;
    const bps = bs.bps;
    // 年度ごとに異なる株価を決定論的に生成
    const priceSeed = seededRandom(hashCode(stockCode + 'vhprice' + i));
    const perMultiple = profile.perRange * (0.7 + priceSeed * 0.6);
    const price = Math.round(eps * perMultiple);
    const per = eps > 0 ? Math.round((price / eps) * 100) / 100 : 0;
    const pbr = bps > 0 ? Math.round((price / bps) * 100) / 100 : 0;
    const marketCap = Math.round((price * profile.sharesOutstanding) / 100); // 億円
    return {
      fiscalYear: ar.fiscalYear,
      stockPrice: price,
      marketCap,
      per,
      pbr,
      roe: ar.roe,
      dividendYield: div.dividendYield,
    };
  });
}

// ============================================
// 既存ジェネレータ
// ============================================

function generateSummary(
  stockCode: string,
  profile: StockProfile,
  annualResults: AnnualResult[],
  balanceSheets: BalanceSheet[]
): CompanySummary {
  const latest = annualResults[annualResults.length - 1];
  const latestBS = balanceSheets[balanceSheets.length - 1];
  const eps = latest.eps;
  const bps = latestBS.bps;
  const price = Math.round(eps * profile.perRange * (1 + seededRandom(hashCode(stockCode + 'price')) * 0.2));

  const changeSeed = seededRandom(hashCode(stockCode + 'change'));
  const priceChange = Math.round((changeSeed * 6 - 3) * 100) / 100;
  const priceChangeAmount = Math.round(price * priceChange / 100);

  return {
    stockCode,
    stockName: profile.name,
    market: profile.market,
    sector: profile.sector,
    industry: profile.industry,
    marketCap: Math.round((price * profile.sharesOutstanding) / 100),
    per: Math.round((price / eps) * 100) / 100,
    pbr: Math.round((price / bps) * 100) / 100,
    dividendYield: Math.round((latest.netIncome * profile.dividendPayout / profile.sharesOutstanding / price) * 10000) / 100,
    roe: latest.roe,
    roa: latest.roa,
    currentPrice: price,
    priceChange,
    priceChangeAmount,
  };
}

function generateAnnualResults(stockCode: string, profile: StockProfile): AnnualResult[] {
  const results: AnnualResult[] = [];

  // baseRevenueは最新年度（2024/3）基準。1990年からの成長を逆算
  const lastIdx = FISCAL_YEARS.length - 1;

  FISCAL_YEARS.forEach((fy, i) => {
    const seed = hashCode(stockCode + fy);
    const yearsFromLatest = i - lastIdx; // 負の値（1990→-34, 2024→0）
    const growthFactor = Math.pow(1 + profile.growthRate, yearsFromLatest);
    const revenue = Math.round(vary(profile.baseRevenue * growthFactor, 0.05, seed));
    const margin = vary(profile.operatingMargin, 0.1, seed + 1);
    const operatingIncome = Math.round(revenue * margin);
    const ordinaryIncome = Math.round(operatingIncome * vary(1.02, 0.05, seed + 2));
    const netIncome = Math.round(ordinaryIncome * vary(0.68, 0.08, seed + 3));
    const eps = Math.round((netIncome / profile.sharesOutstanding) * 100) / 100;
    const totalAssets = Math.round(revenue * vary(1.5, 0.2, seed + 4));
    const equity = Math.round(totalAssets * profile.equityRatio);
    const roe = Math.round((netIncome / equity) * 10000) / 100;
    const roa = Math.round((netIncome / totalAssets) * 10000) / 100;
    const operatingMargin = Math.round((operatingIncome / revenue) * 10000) / 100;

    // 包括利益 = 純利益 ± その他の包括利益
    const comprehensiveIncome = Math.round(netIncome * vary(1.1, 0.3, seed + 5));
    // 原価率・販管費率（営業利益率 = 100% - 原価率 - 販管費率）
    const sgaRatio = Math.round(vary(0.15, 0.04, seed + 6) * 10000) / 100;
    const costRatio = Math.round((100 - operatingMargin - sgaRatio) * 100) / 100;

    const prev = results[i - 1];
    results.push({
      fiscalYear: fy,
      revenue,
      operatingIncome,
      ordinaryIncome,
      netIncome,
      comprehensiveIncome,
      eps,
      roe,
      roa,
      operatingMargin,
      costRatio,
      sgaRatio,
      revenueYoY: prev ? Math.round(((revenue - prev.revenue) / prev.revenue) * 10000) / 100 : undefined,
      operatingIncomeYoY: prev ? Math.round(((operatingIncome - prev.operatingIncome) / prev.operatingIncome) * 10000) / 100 : undefined,
      netIncomeYoY: prev ? Math.round(((netIncome - prev.netIncome) / prev.netIncome) * 10000) / 100 : undefined,
    });
  });

  return results;
}

function generateQuarterlyResults(stockCode: string, profile: StockProfile): QuarterlyResult[] {
  const results: QuarterlyResult[] = [];
  const latestYear = FISCAL_YEARS[FISCAL_YEARS.length - 1];
  const quarterWeights = [0.22, 0.25, 0.28, 0.25];

  for (let q = 0; q < 4; q++) {
    const seed = hashCode(stockCode + latestYear + `Q${q + 1}`);
    // 最新年度 = baseRevenue、前年度は growthRate で逆算
    const yearRevenue = profile.baseRevenue;
    const revenue = Math.round(vary(yearRevenue * quarterWeights[q], 0.08, seed));
    const operatingIncome = Math.round(revenue * vary(profile.operatingMargin, 0.15, seed + 1));
    const ordinaryIncome = Math.round(operatingIncome * vary(1.02, 0.05, seed + 2));
    const netIncome = Math.round(ordinaryIncome * vary(0.68, 0.1, seed + 3));

    const prevSeed = hashCode(stockCode + FISCAL_YEARS[FISCAL_YEARS.length - 2] + `Q${q + 1}`);
    const prevYearRevenue = profile.baseRevenue / (1 + profile.growthRate);
    const prevRevenue = Math.round(vary(prevYearRevenue * quarterWeights[q], 0.08, prevSeed));
    const prevOI = Math.round(prevRevenue * vary(profile.operatingMargin, 0.15, prevSeed + 1));

    results.push({
      period: `${latestYear} ${q + 1}Q`,
      revenue,
      operatingIncome,
      ordinaryIncome,
      netIncome,
      revenueYoY: Math.round(((revenue - prevRevenue) / prevRevenue) * 10000) / 100,
      operatingIncomeYoY: Math.round(((operatingIncome - prevOI) / prevOI) * 10000) / 100,
    });
  }

  return results;
}

function generateBalanceSheets(stockCode: string, profile: StockProfile): BalanceSheet[] {
  const lastIdx = FISCAL_YEARS.length - 1;
  return FISCAL_YEARS.map((fy, i) => {
    const seed = hashCode(stockCode + fy + 'bs');
    const growthFactor = Math.pow(1 + profile.growthRate, i - lastIdx);
    const totalAssets = Math.round(vary(profile.baseRevenue * growthFactor * 1.5, 0.1, seed));
    const equityRatio = vary(profile.equityRatio, 0.05, seed + 1);
    const shareholdersEquity = Math.round(totalAssets * equityRatio);
    const netAssets = Math.round(shareholdersEquity * vary(1.05, 0.03, seed + 2));
    const retainedEarnings = Math.round(shareholdersEquity * vary(0.8, 0.1, seed + 3));
    const interestBearingDebt = Math.round(totalAssets * vary(1 - equityRatio, 0.1, seed + 4) * 0.5);
    const bps = Math.round((shareholdersEquity / profile.sharesOutstanding) * 100) / 100;

    const debtRatio = totalAssets > 0 ? Math.round((interestBearingDebt / totalAssets) * 10000) / 100 : 0;

    return {
      fiscalYear: fy,
      totalAssets,
      netAssets,
      shareholdersEquity,
      equityRatio: Math.round(equityRatio * 10000) / 100,
      retainedEarnings,
      interestBearingDebt,
      debtRatio,
      bps,
    };
  });
}

function generateCashFlows(stockCode: string, profile: StockProfile): CashFlow[] {
  const lastIdx = FISCAL_YEARS.length - 1;
  return FISCAL_YEARS.map((fy, i) => {
    const seed = hashCode(stockCode + fy + 'cf');
    const growthFactor = Math.pow(1 + profile.growthRate, i - lastIdx);
    const baseOI = profile.baseRevenue * growthFactor * profile.operatingMargin;
    const revenue = profile.baseRevenue * growthFactor;
    const operatingCF = Math.round(vary(baseOI * 1.2, 0.15, seed));
    const capex = Math.round(-vary(baseOI * 0.35, 0.2, seed + 4));
    const investingCF = Math.round(capex * vary(1.15, 0.1, seed + 1));
    const financingCF = Math.round(-vary(baseOI * 0.3, 0.3, seed + 2));
    const freeCF = operatingCF + investingCF;
    const cashAndEquivalents = Math.round(vary(baseOI * 2, 0.2, seed + 3));
    const operatingCFMargin = revenue > 0 ? Math.round((operatingCF / revenue) * 10000) / 100 : 0;

    return {
      fiscalYear: fy,
      operatingCF,
      investingCF,
      financingCF,
      freeCF,
      capex,
      cashAndEquivalents,
      operatingCFMargin,
    };
  });
}

function generateDividends(
  stockCode: string,
  profile: StockProfile,
  annualResults: AnnualResult[],
  balanceSheets: BalanceSheet[]
): DividendData[] {
  return FISCAL_YEARS.map((fy, i) => {
    const seed = hashCode(stockCode + fy + 'div');
    const eps = annualResults[i].eps;
    const payoutRatio = vary(profile.dividendPayout, 0.1, seed);
    const dividendPerShare = Math.round(eps * payoutRatio * 10) / 10;
    const price = eps * profile.perRange * (1 + seededRandom(hashCode(stockCode + 'price')) * 0.2);
    const dividendYield = Math.round((dividendPerShare / price) * 10000) / 100;

    // 剰余金の配当 = DPS × 発行株式数
    const surplusDistribution = Math.round(dividendPerShare * profile.sharesOutstanding);
    // 純資産配当率 = 剰余金の配当 / 純資産
    const netAssetDividendRate = balanceSheets[i].netAssets > 0
      ? Math.round((surplusDistribution / balanceSheets[i].netAssets) * 10000) / 100
      : 0;
    // 自社株買い（ランダムに一部年度で発生）
    const hasBuyback = seededRandom(seed + 5) > 0.6;
    const shareBuyback = hasBuyback ? Math.round(vary(surplusDistribution * 0.3, 0.5, seed + 6)) : 0;
    // 総還元額 = 剰余金の配当 + 自社株買い
    const totalReturn = surplusDistribution + shareBuyback;
    // 総還元性向 = 総還元額 / 純利益
    const netIncome = annualResults[i].netIncome;
    const totalReturnRatio = netIncome > 0
      ? Math.round((totalReturn / netIncome) * 10000) / 100
      : 0;

    return {
      fiscalYear: fy,
      dividendPerShare,
      payoutRatio: Math.round(payoutRatio * 10000) / 100,
      dividendYield,
      surplusDistribution,
      netAssetDividendRate,
      shareBuyback,
      totalReturn,
      totalReturnRatio,
    };
  });
}

// ============================================
// 新規ジェネレータ
// ============================================

function generateCompanyProfile(stockCode: string, profile: StockProfile): CompanyProfile {
  const seed = hashCode(stockCode + 'profile');
  const employees = Math.round(vary(profile.baseRevenue / 20, 0.3, seed));
  const averageSalary = Math.round(vary(750, 0.25, seed + 1));
  const averageAge = Math.round(vary(41, 0.08, seed + 2) * 10) / 10;

  return {
    description: profile.description,
    mission: profile.mission,
    vision: profile.vision,
    industryPosition: profile.industryPosition,
    founded: profile.founded,
    employees,
    averageSalary,
    averageAge,
    headquarters: profile.headquarters,
    ceo: profile.ceo,
    fiscalYearEnd: '3月',
    listingDate: profile.listingDate,
    url: profile.url,
  };
}

function generateStockPriceHistory(stockCode: string, _profile: StockProfile, summary: CompanySummary): StockPricePoint[] {
  const points: StockPricePoint[] = [];
  const currentPrice = summary.currentPrice;
  const totalYears = 15; // 15年分のデータを生成
  const days = totalYears * 365;

  // 15年前の株価を逆算（年率5%成長を仮定）
  const startPrice = currentPrice / Math.pow(1.05, totalYears);
  let price = startPrice * vary(1.0, 0.15, hashCode(stockCode + 'startprice15y'));
  const drift = (currentPrice - price) / (days * 0.7) * 0.3;

  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 土日スキップ
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;

    const dateStr = date.toISOString().slice(0, 10);
    const seed = hashCode(stockCode + dateStr);
    const dailyChange = (seededRandom(seed) - 0.48) * price * 0.025;
    price = Math.max(price * 0.3, price + dailyChange + drift);

    const open = Math.round(price * vary(1.0, 0.005, seed + 1));
    const close = Math.round(price);
    const high = Math.round(Math.max(open, close) * vary(1.005, 0.003, seed + 2));
    const low = Math.round(Math.min(open, close) * vary(0.995, 0.003, seed + 3));
    const volume = Math.round(vary(summary.marketCap * 100, 0.5, seed + 4));

    points.push({ date: dateStr, open, high, low, close, volume });
  }

  return points;
}

function generateSegments(stockCode: string, profile: StockProfile, annualResults: AnnualResult[]): BusinessSegment[] {
  const latestRevenue = annualResults[annualResults.length - 1].revenue;
  const colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4'];

  return profile.segmentNames.map((name, i) => {
    const seed = hashCode(stockCode + name + 'seg');
    const weight = profile.segmentWeights[i];
    const revenue = Math.round(latestRevenue * vary(weight, 0.05, seed));
    const segMargin = vary(profile.operatingMargin, 0.3, seed + 1);
    const operatingIncome = Math.round(revenue * segMargin);

    return {
      name,
      revenue,
      operatingIncome,
      percentage: Math.round(weight * 1000) / 10,
      color: colors[i % colors.length],
    };
  });
}

const SHAREHOLDER_POOL = [
  { name: '日本マスタートラスト信託銀行（信託口）', type: 'trust' as const },
  { name: '日本カストディ銀行（信託口）', type: 'trust' as const },
  { name: 'JP MORGAN CHASE BANK', type: 'foreign' as const },
  { name: 'STATE STREET BANK AND TRUST', type: 'foreign' as const },
  { name: 'SSBTC CLIENT OMNIBUS ACCOUNT', type: 'foreign' as const },
  { name: 'THE BANK OF NEW YORK MELLON', type: 'foreign' as const },
  { name: '三井住友銀行', type: 'bank' as const },
  { name: '日本生命保険', type: 'insurance' as const },
  { name: '第一生命保険', type: 'insurance' as const },
  { name: 'みずほ銀行', type: 'bank' as const },
  { name: '三菱UFJ銀行', type: 'bank' as const },
  { name: '野村證券金融', type: 'institution' as const },
  { name: 'BARCLAYS SECURITIES JAPAN', type: 'foreign' as const },
  { name: 'トヨタ自動車', type: 'institution' as const },
  { name: 'GOVERNMENT OF NORWAY', type: 'foreign' as const },
];

function generateShareholders(stockCode: string, profile: StockProfile): Shareholder[] {
  const seed = hashCode(stockCode + 'shareholders');
  const shareholders: Shareholder[] = [];

  // 自己株式
  const treasuryPct = Math.round(vary(3, 0.5, seed) * 100) / 100;
  shareholders.push({
    name: `${profile.name}（自己株口）`,
    shares: Math.round(profile.sharesOutstanding * treasuryPct / 100 * 1000),
    percentage: treasuryPct,
    type: 'treasury',
  });

  // 機関投資家から選択
  let remainingPct = vary(40, 0.2, seed + 1);
  const usedIndices = new Set<number>();

  for (let i = 0; i < 9 && remainingPct > 1; i++) {
    let idx: number;
    let retry = 0;
    do {
      idx = Math.floor(seededRandom(seed + 10 + i * 3 + retry * 7) * SHAREHOLDER_POOL.length);
      retry++;
    } while (usedIndices.has(idx) && retry < 100);
    usedIndices.add(idx);

    const sh = SHAREHOLDER_POOL[idx];
    const pct = Math.round(vary(remainingPct / (10 - i), 0.3, seed + 20 + i) * 100) / 100;
    const actualPct = Math.min(pct, remainingPct);
    remainingPct -= actualPct;

    shareholders.push({
      name: sh.name,
      shares: Math.round(profile.sharesOutstanding * actualPct / 100 * 1000),
      percentage: actualPct,
      type: sh.type,
    });
  }

  return shareholders.sort((a, b) => b.percentage - a.percentage);
}

function generateForecast(stockCode: string, profile: StockProfile, annualResults: AnnualResult[]): EarningsForecast {
  const latest = annualResults[annualResults.length - 1];
  const seed = hashCode(stockCode + 'forecast');
  const growthAdj = vary(1 + profile.growthRate, 0.3, seed);

  const revenueEstimate = Math.round(latest.revenue * growthAdj);
  const oiEstimate = Math.round(latest.operatingIncome * vary(growthAdj, 0.1, seed + 1));
  const ordinaryEstimate = Math.round(oiEstimate * vary(1.02, 0.05, seed + 5));
  const niEstimate = Math.round(latest.netIncome * vary(growthAdj, 0.15, seed + 2));
  const epsEstimate = Math.round((niEstimate / profile.sharesOutstanding) * 100) / 100;
  const dividendEstimate = Math.round(epsEstimate * vary(profile.dividendPayout, 0.1, seed + 3) * 10) / 10;

  return {
    fiscalYear: '2025/3',
    revenueEstimate,
    operatingIncomeEstimate: oiEstimate,
    ordinaryIncomeEstimate: ordinaryEstimate,
    netIncomeEstimate: niEstimate,
    epsEstimate,
    dividendEstimate,
    revenueYoY: Math.round(((revenueEstimate - latest.revenue) / latest.revenue) * 10000) / 100,
    operatingIncomeYoY: Math.round(((oiEstimate - latest.operatingIncome) / latest.operatingIncome) * 10000) / 100,
    netIncomeYoY: Math.round(((niEstimate - latest.netIncome) / latest.netIncome) * 10000) / 100,
    source: seededRandom(seed + 4) > 0.5 ? 'company' : 'consensus',
  };
}

function generateCommentary(profile: StockProfile): ShikihoCommentary {
  return {
    headline: profile.commentHeadline,
    body: profile.commentBody,
    outlook: profile.commentOutlook,
    updatedAt: '2024-12-15',
  };
}

function generateMetricsDashboard(
  stockCode: string,
  profile: StockProfile,
  annualResults: AnnualResult[],
  balanceSheets: BalanceSheet[],
  cashFlows: CashFlow[],
  summary: CompanySummary,
): MetricsDashboard {
  const latest = annualResults[annualResults.length - 1];
  const latestBS = balanceSheets[balanceSheets.length - 1];
  const latestCF = cashFlows[cashFlows.length - 1];
  const seed = hashCode(stockCode + 'dashboard');

  // 収益性
  const netMargin = Math.round((latest.netIncome / latest.revenue) * 10000) / 100;
  const roic = Math.round((latest.operatingIncome * 0.7 / (latestBS.shareholdersEquity + latestBS.interestBearingDebt)) * 10000) / 100;

  // 成長性（3年・5年）
  const y3ago = annualResults[Math.max(0, annualResults.length - 4)];
  const y5ago = annualResults[0];
  const revenueGrowth3Y = Math.round(((latest.revenue / y3ago.revenue - 1)) * 10000) / 100;
  const oiGrowth3Y = Math.round(((latest.operatingIncome / y3ago.operatingIncome - 1)) * 10000) / 100;
  const epsGrowth3Y = Math.round(((latest.eps / y3ago.eps - 1)) * 10000) / 100;
  const revenueCAGR5Y = Math.round((Math.pow(latest.revenue / y5ago.revenue, 1 / 4) - 1) * 10000) / 100;

  // 安全性
  const currentRatio = Math.round(vary(1.3, 0.3, seed) * 100) / 100;
  const interestCoverage = latestBS.interestBearingDebt > 0
    ? Math.round((latest.operatingIncome / (latestBS.interestBearingDebt * 0.02)) * 10) / 10
    : 999;
  const deRatio = Math.round((latestBS.interestBearingDebt / latestBS.shareholdersEquity) * 100) / 100;
  const netDebt = latestBS.interestBearingDebt - latestCF.cashAndEquivalents;
  const netDeRatio = Math.round((Math.max(0, netDebt) / latestBS.shareholdersEquity) * 100) / 100;

  // 割安性
  const pcfr = latestCF.operatingCF > 0
    ? Math.round((summary.currentPrice * profile.sharesOutstanding / latestCF.operatingCF) * 100) / 100
    : 0;
  const ebitda = latest.operatingIncome + Math.round(vary(latest.operatingIncome * 0.3, 0.2, seed + 10));
  const ev = summary.marketCap * 100 + latestBS.interestBearingDebt - latestCF.cashAndEquivalents;
  const evToEbitda = ebitda > 0 ? Math.round((ev / ebitda) * 100) / 100 : 0;

  return {
    profitability: {
      operatingMargin: latest.operatingMargin,
      netMargin,
      roe: latest.roe,
      roa: latest.roa,
      roic,
    },
    growth: {
      revenueGrowth3Y,
      operatingIncomeGrowth3Y: oiGrowth3Y,
      epsGrowth3Y,
      revenueCAGR5Y,
    },
    stability: {
      equityRatio: latestBS.equityRatio,
      currentRatio: currentRatio * 100,
      interestCoverageRatio: interestCoverage,
      debtToEquityRatio: deRatio,
      netDebtToEquityRatio: netDeRatio,
    },
    valuation: {
      per: summary.per,
      pbr: summary.pbr,
      pcfr,
      evToEbitda,
      dividendYield: summary.dividendYield,
    },
  };
}

function generatePerShareMetrics(
  profile: StockProfile,
  annualResults: AnnualResult[],
  balanceSheets: BalanceSheet[],
  cashFlows: CashFlow[],
  dividends: DividendData[],
): PerShareMetrics[] {
  return FISCAL_YEARS.map((fy, i) => ({
    fiscalYear: fy,
    eps: annualResults[i].eps,
    bps: balanceSheets[i].bps,
    dps: dividends[i].dividendPerShare,
    cfps: Math.round((cashFlows[i].operatingCF / profile.sharesOutstanding) * 100) / 100,
  }));
}

/**
 * 利用可能な銘柄コード一覧を取得
 */
export function getAvailableStockCodes(): string[] {
  return Object.keys(STOCK_PROFILES);
}

/**
 * 利用可能な銘柄コード+企業名の一覧を取得
 */
export function getAvailableStocks(): { code: string; name: string }[] {
  return Object.entries(STOCK_PROFILES).map(([code, p]) => ({ code, name: p.name }));
}

// ============================================
// 決算年度別 詳細財務諸表（有報データ）
// ============================================

/**
 * 指定銘柄・決算年度の詳細財務諸表を取得（モック）
 */
export async function getFiscalYearDetail(
  stockCode: string,
  fiscalYear: string,
): Promise<FiscalYearDetail | null> {
  await new Promise((r) => setTimeout(r, 300));

  const profile = STOCK_PROFILES[stockCode];
  if (!profile) return null;

  const fyIdx = FISCAL_YEARS.indexOf(fiscalYear);
  if (fyIdx < 0) return null;

  const annualResults = generateAnnualResults(stockCode, profile);
  const balanceSheets = generateBalanceSheets(stockCode, profile);
  const cashFlows = generateCashFlows(stockCode, profile);

  const ar = annualResults[fyIdx];
  const prevAr = fyIdx > 0 ? annualResults[fyIdx - 1] : undefined;
  const bs = balanceSheets[fyIdx];
  const prevBs = fyIdx > 0 ? balanceSheets[fyIdx - 1] : undefined;
  const cf = cashFlows[fyIdx];
  const prevCf = fyIdx > 0 ? cashFlows[fyIdx - 1] : undefined;

  const endYear = parseInt(fiscalYear.split('/')[0]);
  const endMonth = parseInt(fiscalYear.split('/')[1]);
  const startMonth = endMonth === 3 ? 4 : endMonth + 1;
  const startYear = endMonth === 3 ? endYear - 1 : endYear;
  const fiscalPeriod = `${startYear}/${String(startMonth).padStart(2, '0')}-${endYear}/${String(endMonth).padStart(2, '0')}`;

  const prevEndYear = endYear - 1;
  const prevPeriod = `${prevEndYear - 1}/${String(startMonth).padStart(2, '0')}-${prevEndYear}/${String(endMonth).padStart(2, '0')}`;

  // 提出日を決算月の3ヶ月後に設定
  const filingDate = `${endYear}-${String(endMonth + 3).padStart(2, '0')}-21`;

  const seed = hashCode(stockCode + fiscalYear + 'detail');

  const plItems = generateDetailedPL(ar, prevAr, seed);
  const bsItems = generateDetailedBS(bs, prevBs, seed);
  const cfItems = generateDetailedCF(cf, prevCf, seed);

  return {
    stockCode,
    stockName: profile.name,
    fiscalYear,
    fiscalPeriod,
    prevFiscalPeriod: fyIdx > 0 ? prevPeriod : undefined,
    reportType: '有価証券報告書',
    filingDate,
    yuhoUrl: profile.yuhoUrlTemplate.replace('{year}', String(endYear)),
    plItems,
    bsItems,
    cfItems,
  };
}

function generateDetailedPL(
  ar: AnnualResult,
  prevAr: AnnualResult | undefined,
  seed: number,
): PLLineItem[] {
  const r = (s: number) => seededRandom(seed + s);
  const rev = ar.revenue;
  const prevRev = prevAr?.revenue;
  const oi = ar.operatingIncome;
  const prevOi = prevAr?.operatingIncome;
  const ord = ar.ordinaryIncome;
  const prevOrd = prevAr?.ordinaryIncome;
  const ni = ar.netIncome;
  const prevNi = prevAr?.netIncome;

  // 売上原価 = 売上 - 営業利益 - 販管費  (販管費を先に決める)
  const sgaRatio = 0.12 + r(10) * 0.08; // 12-20%
  const sga = Math.round(rev * sgaRatio);
  const cogs = rev - oi - sga;
  const grossProfit = rev - cogs;

  const prevSga = prevRev ? Math.round(prevRev * (0.12 + r(11) * 0.08)) : undefined;
  const prevCogs = prevRev && prevOi && prevSga ? prevRev - prevOi - prevSga : undefined;
  const prevGross = prevRev && prevCogs ? prevRev - prevCogs : undefined;

  // 営業外
  const interestIncome = Math.round(rev * (0.001 + r(20) * 0.002));
  const dividendIncome = Math.round(rev * (0.001 + r(21) * 0.003));
  const interestExpense = Math.round(rev * (0.002 + r(22) * 0.005));
  const otherNonOpIncome = Math.round(rev * r(23) * 0.003);
  const otherNonOpExpense = Math.round(rev * r(24) * 0.002);
  const nonOpIncome = interestIncome + dividendIncome + otherNonOpIncome;
  const nonOpExpense = interestExpense + otherNonOpExpense;

  // 特別利益・損失
  const extraIncome = Math.round(rev * r(30) * 0.005);
  const extraLoss = Math.round(rev * r(31) * 0.008);
  const taxBeforeProfit = ord + extraIncome - extraLoss;
  const tax = taxBeforeProfit - ni;

  const items: PLLineItem[] = [
    { label: '売上高', value: rev, prevValue: prevRev, isBold: true, indent: 0 },
    { label: '売上原価', value: cogs, prevValue: prevCogs, indent: 1 },
    { label: '売上総利益', value: grossProfit, prevValue: prevGross, isBold: true, indent: 0 },
    { label: '販売費及び一般管理費', value: sga, prevValue: prevSga, indent: 1 },
    { label: '営業利益', value: oi, prevValue: prevOi, isBold: true, indent: 0 },
    { label: '営業外収益', value: nonOpIncome, indent: 0 },
    { label: '  受取利息', value: interestIncome, indent: 2 },
    { label: '  受取配当金', value: dividendIncome, indent: 2 },
    { label: '  その他', value: otherNonOpIncome, indent: 2 },
    { label: '営業外費用', value: nonOpExpense, indent: 0 },
    { label: '  支払利息', value: interestExpense, indent: 2 },
    { label: '  その他', value: otherNonOpExpense, indent: 2 },
    { label: '経常利益', value: ord, prevValue: prevOrd, isBold: true, indent: 0 },
    { label: '特別利益', value: extraIncome, indent: 1 },
    { label: '特別損失', value: extraLoss, indent: 1 },
    { label: '税金等調整前当期純利益', value: taxBeforeProfit, isBold: true, indent: 0 },
    { label: '法人税等', value: tax, indent: 1 },
    { label: '当期純利益', value: ni, prevValue: prevNi, isBold: true, indent: 0 },
  ];

  return items;
}

function generateDetailedBS(
  bs: BalanceSheet,
  prevBs: BalanceSheet | undefined,
  seed: number,
): BSLineItem[] {
  const r = (s: number) => seededRandom(seed + s);
  const ta = bs.totalAssets;
  const prevTa = prevBs?.totalAssets;

  // 資産の部
  const cashRatio = 0.08 + r(40) * 0.10;
  const cash = Math.round(ta * cashRatio);
  const receivables = Math.round(ta * (0.10 + r(41) * 0.08));
  const inventories = Math.round(ta * (0.05 + r(42) * 0.07));
  const otherCurrent = Math.round(ta * (0.02 + r(43) * 0.03));
  const currentAssets = cash + receivables + inventories + otherCurrent;

  const ppe = Math.round(ta * (0.15 + r(44) * 0.15));
  const intangibles = Math.round(ta * (0.03 + r(45) * 0.07));
  const investmentSecurities = Math.round(ta * (0.05 + r(46) * 0.10));
  const otherFixed = ta - currentAssets - ppe - intangibles - investmentSecurities;
  const fixedAssets = ta - currentAssets;

  // 負債の部
  const totalLiabilities = ta - bs.netAssets;
  const shortTermDebt = Math.round(bs.interestBearingDebt * (0.2 + r(50) * 0.3));
  const accountsPayable = Math.round(totalLiabilities * (0.12 + r(51) * 0.10));
  const otherCurrentLiab = Math.round(totalLiabilities * (0.05 + r(52) * 0.05));
  const currentLiabilities = shortTermDebt + accountsPayable + otherCurrentLiab;

  const longTermDebt = bs.interestBearingDebt - shortTermDebt;
  const retirementBenefits = Math.round(totalLiabilities * (0.02 + r(53) * 0.03));
  const otherFixedLiab = totalLiabilities - currentLiabilities - longTermDebt - retirementBenefits;
  const fixedLiabilities = totalLiabilities - currentLiabilities;

  const items: BSLineItem[] = [
    // 資産の部
    { label: '【資産の部】', value: ta, prevValue: prevTa, isBold: true, indent: 0 },
    { label: '流動資産', value: currentAssets, isBold: true, indent: 0 },
    { label: '  現金及び預金', value: cash, indent: 2 },
    { label: '  受取手形及び売掛金', value: receivables, indent: 2 },
    { label: '  棚卸資産', value: inventories, indent: 2 },
    { label: '  その他', value: otherCurrent, indent: 2 },
    { label: '固定資産', value: fixedAssets, isBold: true, indent: 0 },
    { label: '  有形固定資産', value: ppe, indent: 2 },
    { label: '  無形固定資産', value: intangibles, indent: 2 },
    { label: '  投資有価証券', value: investmentSecurities, indent: 2 },
    { label: '  その他', value: Math.max(0, otherFixed), indent: 2 },
    { label: '資産合計', value: ta, prevValue: prevTa, isBold: true, indent: 0 },

    // 負債の部
    { label: '【負債の部】', value: totalLiabilities, isBold: true, indent: 0 },
    { label: '流動負債', value: currentLiabilities, isBold: true, indent: 0 },
    { label: '  短期借入金', value: shortTermDebt, indent: 2 },
    { label: '  買掛金', value: accountsPayable, indent: 2 },
    { label: '  その他', value: otherCurrentLiab, indent: 2 },
    { label: '固定負債', value: fixedLiabilities, isBold: true, indent: 0 },
    { label: '  長期借入金', value: longTermDebt, indent: 2 },
    { label: '  退職給付に係る負債', value: retirementBenefits, indent: 2 },
    { label: '  その他', value: Math.max(0, otherFixedLiab), indent: 2 },
    { label: '負債合計', value: totalLiabilities, isBold: true, indent: 0 },

    // 純資産の部
    { label: '【純資産の部】', value: bs.netAssets, isBold: true, indent: 0 },
    { label: '  株主資本', value: bs.shareholdersEquity, indent: 1 },
    { label: '    利益剰余金', value: bs.retainedEarnings, indent: 2 },
    { label: '  その他', value: bs.netAssets - bs.shareholdersEquity, indent: 1 },
    { label: '純資産合計', value: bs.netAssets, isBold: true, indent: 0 },
    { label: '負債純資産合計', value: ta, prevValue: prevTa, isBold: true, indent: 0 },
  ];

  return items;
}

function generateDetailedCF(
  cf: CashFlow,
  prevCf: CashFlow | undefined,
  seed: number,
): CFLineItem[] {
  const r = (s: number) => seededRandom(seed + s);

  // 営業CF内訳
  const taxBeforeProfit = Math.round(cf.operatingCF * (0.6 + r(60) * 0.3));
  const depreciation = Math.round(Math.abs(cf.operatingCF) * (0.15 + r(61) * 0.15));
  const workingCapitalChange = Math.round(cf.operatingCF * (r(62) - 0.5) * 0.2);
  const taxPaid = Math.round(taxBeforeProfit * -(0.25 + r(63) * 0.10));
  const otherOpCF = cf.operatingCF - taxBeforeProfit - depreciation - workingCapitalChange - taxPaid;

  // 投資CF内訳
  const capex = Math.round(cf.investingCF * (0.7 + r(64) * 0.2));
  const acquisitions = Math.round(cf.investingCF * r(65) * 0.2);
  const otherInvCF = cf.investingCF - capex - acquisitions;

  // 財務CF内訳
  const debtRepayment = Math.round(cf.financingCF * (0.4 + r(66) * 0.3));
  const dividendPaid = Math.round(cf.financingCF * (0.2 + r(67) * 0.2));
  const otherFinCF = cf.financingCF - debtRepayment - dividendPaid;

  const items: CFLineItem[] = [
    { label: '営業活動によるキャッシュ・フロー', value: cf.operatingCF, prevValue: prevCf?.operatingCF, isBold: true, indent: 0 },
    { label: '  税金等調整前当期純利益', value: taxBeforeProfit, indent: 2 },
    { label: '  減価償却費', value: depreciation, indent: 2 },
    { label: '  運転資本の増減', value: workingCapitalChange, indent: 2 },
    { label: '  法人税等の支払額', value: taxPaid, indent: 2 },
    { label: '  その他', value: otherOpCF, indent: 2 },
    { label: '投資活動によるキャッシュ・フロー', value: cf.investingCF, prevValue: prevCf?.investingCF, isBold: true, indent: 0 },
    { label: '  有形固定資産の取得', value: capex, indent: 2 },
    { label: '  事業取得', value: acquisitions, indent: 2 },
    { label: '  その他', value: otherInvCF, indent: 2 },
    { label: '財務活動によるキャッシュ・フロー', value: cf.financingCF, prevValue: prevCf?.financingCF, isBold: true, indent: 0 },
    { label: '  借入金の返済', value: debtRepayment, indent: 2 },
    { label: '  配当金の支払額', value: dividendPaid, indent: 2 },
    { label: '  その他', value: otherFinCF, indent: 2 },
    { label: 'フリー・キャッシュ・フロー', value: cf.freeCF, prevValue: prevCf?.freeCF, isBold: true, indent: 0 },
    { label: '現金及び現金同等物の期末残高', value: cf.cashAndEquivalents, prevValue: prevCf?.cashAndEquivalents, isBold: true, indent: 0 },
  ];

  return items;
}

/**
 * 指定銘柄の利用可能な決算年度一覧を返す
 */
export function getAvailableFiscalYears(): string[] {
  return [...FISCAL_YEARS];
}

// ============================================
// 企業情報データ生成
// ============================================

const DIRECTOR_POSITIONS = ['代表取締役社長', '代表取締役副社長', '取締役 専務執行役員', '取締役 常務執行役員', '取締役（社外）', '取締役（社外）', '常勤監査役', '監査役（社外）'];
const DIRECTOR_NAMES = [
  '山田太郎', '鈴木一郎', '佐藤花子', '田中健一', '高橋美咲', '渡辺聡', '伊藤恵子', '小林正志',
  '中村裕子', '松本剛', '加藤智子', '吉田浩二', '井上幸子', '木村達也',
];
const SUBSIDIARY_NAMES_POOL = [
  ['セールス', 'マニュファクチャリング', 'テクノロジー', 'ファイナンス', 'ロジスティクス', 'インターナショナル', 'ソリューションズ', 'デジタル'],
  ['USA Inc.', 'Europe GmbH', 'Asia Pacific Pte.', 'China Co., Ltd.', 'Thailand Co., Ltd.'],
];

const DIRECTOR_CAREERS: string[][] = [
  ['1985年 東京大学法学部卒業', '1985年 当社入社', '2005年 取締役就任', '2015年 代表取締役社長就任（現任）'],
  ['1988年 慶應義塾大学経済学部卒業', '1988年 当社入社', '2008年 執行役員就任', '2017年 代表取締役副社長就任（現任）'],
  ['1990年 早稲田大学商学部卒業', '1990年 当社入社', '2010年 経営企画本部長', '2018年 取締役専務執行役員就任（現任）'],
  ['1992年 京都大学工学部卒業', '1992年 当社入社', '2012年 技術開発本部長', '2020年 取締役常務執行役員就任（現任）'],
  ['1987年 一橋大学商学部卒業', '1987年 三菱商事株式会社入社', '2010年 株式会社ABC社外取締役', '2022年 当社社外取締役就任（現任）'],
  ['1985年 東京大学経済学部卒業', '1985年 大蔵省入省', '2008年 金融庁審議官', '2019年 当社社外取締役就任（現任）'],
  ['1991年 中央大学法学部卒業', '1991年 当社入社', '2015年 内部監査室長', '2021年 常勤監査役就任（現任）'],
  ['1986年 東京大学法学部卒業', '1986年 弁護士登録', '2000年 森・濱田松本法律事務所パートナー', '2020年 当社社外監査役就任（現任）'],
  ['1983年 大阪大学経済学部卒業', '1983年 住友銀行入行', '2010年 三井住友銀行常務取締役', '2018年 当社代表取締役社長就任（現任）'],
  ['1990年 東北大学工学部卒業', '1990年 当社入社', '2016年 生産本部長', '2022年 取締役常務執行役員就任（現任）'],
  ['1989年 お茶の水女子大学文教育学部卒業', '1989年 公認会計士登録', '2005年 有限責任監査法人トーマツパートナー', '2021年 当社社外取締役就任（現任）'],
  ['1984年 名古屋大学法学部卒業', '1984年 当社入社', '2006年 海外事業部長', '2016年 代表取締役副社長就任（現任）'],
  ['1993年 上智大学経済学部卒業', '1993年 当社入社', '2018年 人事総務本部長', '2023年 取締役就任（現任）'],
  ['1988年 神戸大学経営学部卒業', '1988年 野村證券株式会社入社', '2012年 野村アセットマネジメント取締役', '2022年 当社社外監査役就任（現任）'],
];

function generateCompanyInfo(
  stockCode: string,
  profile: StockProfile,
  annualResults: AnnualResult[],
  balanceSheets: BalanceSheet[],
  dividends: DividendData[],
  currentPrice: number,
): CompanyInfoData {
  const seed = hashCode(stockCode + 'companyInfo');

  // --- 役員の状況 ---
  const directorCount = 8 + Math.floor(seededRandom(seed) * 6);
  const directors: Director[] = Array.from({ length: directorCount }, (_, i) => {
    const s = seed + i * 31;
    const posIdx = i < DIRECTOR_POSITIONS.length ? i : Math.floor(seededRandom(s + 1) * DIRECTOR_POSITIONS.length);
    const isOutside = DIRECTOR_POSITIONS[posIdx].includes('社外');
    // 持ち株数: 社長は多め、社外は少なめ
    const baseShares = isOutside
      ? 1000 + Math.floor(seededRandom(s + 10) * 5000)
      : (i === 0 ? 80000 + Math.floor(seededRandom(s + 10) * 120000) : 10000 + Math.floor(seededRandom(s + 10) * 50000));
    const shares = Math.round(baseShares / 100) * 100; // 100株単位
    const sharesValue = Math.round(shares * currentPrice / 10000); // 万円
    // 保有株推移（過去5年分）
    const shareHistory = Array.from({ length: 5 }, (_, yi) => {
      const year = 2022 + yi;
      const ratio = 0.6 + yi * 0.1 + seededRandom(s + 20 + yi) * 0.05;
      const histShares = Math.round((shares * ratio) / 100) * 100;
      const histPrice = currentPrice * (0.7 + yi * 0.08 + seededRandom(s + 30 + yi) * 0.1);
      return {
        year: `${year}年`,
        shares: histShares,
        sharesValue: Math.round(histShares * histPrice / 10000),
      };
    });

    // 他社保有株（0〜3銘柄）
    const otherStockCodes = Object.keys(STOCK_PROFILES).filter(c => c !== stockCode);
    const holdingCount = Math.floor(seededRandom(s + 50) * 4);
    const otherHoldings = Array.from({ length: holdingCount }, (_, hi) => {
      const codeIdx = Math.floor(seededRandom(s + 60 + hi) * otherStockCodes.length);
      const code = otherStockCodes[codeIdx];
      const sp = STOCK_PROFILES[code];
      const hShares = Math.round((500 + seededRandom(s + 70 + hi) * 10000) / 100) * 100;
      const hPrice = sp.baseRevenue / sp.sharesOutstanding * (0.001 + seededRandom(s + 80 + hi) * 0.002);
      return {
        stockCode: code,
        stockName: sp.name,
        shares: hShares,
        value: Math.round(hShares * hPrice / 10000),
      };
    });

    return {
      name: DIRECTOR_NAMES[i % DIRECTOR_NAMES.length],
      position: DIRECTOR_POSITIONS[posIdx],
      age: 50 + Math.floor(seededRandom(s + 2) * 20),
      tenure: `${1 + Math.floor(seededRandom(s + 3) * 15)}年`,
      isOutside,
      shares,
      sharesValue,
      career: DIRECTOR_CAREERS[i % DIRECTOR_CAREERS.length].join(' → '),
      shareHistory,
      otherHoldings,
    };
  });

  // --- 役員報酬 ---
  const recentYears = annualResults.slice(-5);
  const directorCompensation: DirectorCompensation[] = recentYears.flatMap((ar, yi) => {
    const s = seed + yi * 97;
    const baseComp = Math.round(vary(300, 0.3, s));
    return [
      { fiscalYear: ar.fiscalYear, category: '取締役', headcount: 8 + Math.floor(seededRandom(s + 1) * 3), fixedComp: baseComp, performanceComp: Math.round(baseComp * 0.4 * seededRandom(s + 2)), stockComp: Math.round(baseComp * 0.2 * seededRandom(s + 3)), totalComp: 0 },
      { fiscalYear: ar.fiscalYear, category: '監査役', headcount: 3 + Math.floor(seededRandom(s + 4) * 2), fixedComp: Math.round(baseComp * 0.15), performanceComp: 0, stockComp: 0, totalComp: 0 },
      { fiscalYear: ar.fiscalYear, category: '社外役員', headcount: 3 + Math.floor(seededRandom(s + 5) * 3), fixedComp: Math.round(baseComp * 0.1), performanceComp: 0, stockComp: 0, totalComp: 0 },
    ].map(c => ({ ...c, totalComp: c.fixedComp + c.performanceComp + c.stockComp }));
  });

  // --- 1億以上の役員 ---
  const highPaidDirectors: HighPaidDirector[] = directors.slice(0, 2 + Math.floor(seededRandom(seed + 200) * 3)).map((d, i) => {
    const s = seed + i * 41 + 300;
    const fixed = Math.round(vary(60, 0.3, s));
    const perf = Math.round(vary(40, 0.4, s + 1));
    const stock = Math.round(vary(20, 0.5, s + 2));
    return { name: d.name, position: d.position, fixedComp: fixed, performanceComp: perf, stockComp: stock, totalComp: fixed + perf + stock };
  });

  // --- 監査報酬の推移 ---
  const auditFees: AuditFee[] = recentYears.map((ar, i) => {
    const s = seed + i * 53 + 400;
    const audit = Math.round(vary(200, 0.2, s));
    const nonAudit = Math.round(vary(30, 0.5, s + 1));
    return { fiscalYear: ar.fiscalYear, auditFee: audit, nonAuditFee: nonAudit, totalFee: audit + nonAudit };
  });

  // --- 社員の状況 ---
  const employeeSegments: EmployeeSegment[] = profile.segmentNames.map((name, i) => {
    const s = seed + i * 67 + 500;
    const totalEmployees = Math.round(vary(profile.baseRevenue / 50, 0.3, s));
    const weight = profile.segmentWeights[i];
    return {
      segmentName: name,
      employeeCount: Math.round(totalEmployees * weight),
      averageAge: Math.round(vary(38, 0.1, s + 1) * 10) / 10,
      averageTenure: Math.round(vary(12, 0.3, s + 2) * 10) / 10,
      averageSalary: Math.round(vary(700, 0.2, s + 3)),
    };
  });

  // --- 従業員の推移 ---
  const last10 = annualResults.slice(-10);
  const baseEmps = employeeSegments.reduce((sum, seg) => sum + seg.employeeCount, 0);
  const employeeTrends: EmployeeTrend[] = last10.map((ar, i) => {
    const s = seed + i * 73 + 600;
    const factor = 0.7 + (i / last10.length) * 0.3;
    return {
      fiscalYear: ar.fiscalYear,
      employeeCount: Math.round(baseEmps * factor * (1 + (seededRandom(s) - 0.5) * 0.05)),
      tempCount: Math.round(baseEmps * factor * 0.15 * (1 + (seededRandom(s + 1) - 0.5) * 0.1)),
    };
  });

  // --- 平均年収の推移 ---
  const baseSalary = employeeSegments.length > 0
    ? Math.round(employeeSegments.reduce((sum, seg) => sum + seg.averageSalary * seg.employeeCount, 0) / baseEmps)
    : 700;
  const salaryTrends: SalaryTrend[] = last10.map((ar, i) => {
    const s = seed + i * 79 + 700;
    const factor = 0.85 + (i / last10.length) * 0.15;
    return {
      fiscalYear: ar.fiscalYear,
      averageSalary: Math.round(baseSalary * factor * (1 + (seededRandom(s) - 0.5) * 0.04)),
      averageAge: Math.round(vary(38, 0.05, s + 1) * 10) / 10,
      averageTenure: Math.round(vary(12, 0.1, s + 2) * 10) / 10,
    };
  });

  // --- 借入金等の返済予定 ---
  const latestBS = balanceSheets[balanceSheets.length - 1];
  const totalDebt = latestBS ? latestBS.interestBearingDebt : 500000;
  const debtRepayment: DebtRepaymentSchedule[] = ['短期借入金', '長期借入金', '社債', 'リース債務'].map((cat, i) => {
    const s = seed + i * 83 + 800;
    const catWeight = [0.15, 0.45, 0.30, 0.10][i];
    const catTotal = Math.round(totalDebt * catWeight);
    const w = [0.3, 0.2, 0.15, 0.12, 0.10, 0.13].map((w, j) => Math.round(catTotal * w * (1 + (seededRandom(s + j) - 0.5) * 0.3)));
    const sum = w.reduce((a, b) => a + b, 0);
    return { category: cat, within1Year: w[0], within2Years: w[1], within3Years: w[2], within4Years: w[3], within5Years: w[4], over5Years: w[5], total: sum };
  });

  // --- 主な資産及び負債の内訳 ---
  const totalAssets = latestBS ? latestBS.totalAssets : 10000000;
  const assetItems: [string, number][] = [
    ['現金及び預金', 0.08], ['受取手形及び売掛金', 0.10], ['有価証券', 0.05], ['棚卸資産', 0.06],
    ['有形固定資産', 0.25], ['無形固定資産', 0.08], ['投資有価証券', 0.15],
  ];
  const liabilityItems: [string, number][] = [
    ['支払手形及び買掛金', 0.08], ['短期借入金', 0.05], ['長期借入金', 0.15], ['社債', 0.10],
    ['退職給付に係る負債', 0.04],
  ];
  const assetLiabilityBreakdown: AssetLiabilityItem[] = [
    ...assetItems.map(([label, pct], i) => {
      const s = seed + i * 89 + 900;
      const adjPct = pct * (1 + (seededRandom(s) - 0.5) * 0.3);
      return { category: 'asset' as const, label, amount: Math.round(totalAssets * adjPct), percentage: Math.round(adjPct * 1000) / 10 };
    }),
    ...liabilityItems.map(([label, pct], i) => {
      const s = seed + i * 91 + 950;
      const adjPct = pct * (1 + (seededRandom(s) - 0.5) * 0.3);
      return { category: 'liability' as const, label, amount: Math.round(totalAssets * adjPct), percentage: Math.round(adjPct * 1000) / 10 };
    }),
  ];

  // --- 関係会社・投資先 ---
  const companyShort = profile.name.replace(/ホールディングス|グループ|工業/g, '').slice(0, 4);
  const subsidiaries: Subsidiary[] = [
    ...SUBSIDIARY_NAMES_POOL[0].slice(0, 3 + Math.floor(seededRandom(seed + 1000) * 4)).map((suffix, i) => {
      const s = seed + i * 97 + 1100;
      return {
        name: `${companyShort}${suffix}`,
        location: ['東京都', '大阪府', '愛知県', '神奈川県'][i % 4],
        capitalAmount: Math.round(vary(1000, 0.5, s)),
        ownershipPct: 100,
        business: profile.segmentNames[i % profile.segmentNames.length] + '事業',
        isConsolidated: true,
        relationship: 'subsidiary' as const,
      };
    }),
    ...SUBSIDIARY_NAMES_POOL[1].slice(0, 2 + Math.floor(seededRandom(seed + 1050) * 3)).map((suffix, i) => {
      const s = seed + i * 101 + 1200;
      return {
        name: `${companyShort} ${suffix}`,
        location: ['米国', 'ドイツ', 'シンガポール', '中国', 'タイ'][i % 5],
        capitalAmount: Math.round(vary(5000, 0.6, s)),
        ownershipPct: Math.round(vary(80, 0.2, s + 1)),
        business: '海外' + profile.segmentNames[0] + '事業',
        isConsolidated: true,
        relationship: 'subsidiary' as const,
      };
    }),
    ...[0, 1].map(i => {
      const s = seed + i * 103 + 1300;
      return {
        name: `${DIRECTOR_NAMES[(i + 5) % DIRECTOR_NAMES.length]}テクノロジーズ`,
        location: '東京都',
        capitalAmount: Math.round(vary(500, 0.5, s)),
        ownershipPct: Math.round(vary(30, 0.3, s + 1)),
        business: 'テクノロジー開発',
        isConsolidated: false,
        relationship: 'affiliate' as const,
      };
    }),
  ];

  // --- 配当/株主還元 ---
  const recentDividends = dividends.slice(-10);
  const shareholderReturns: ShareholderReturn[] = recentDividends.map((d, i) => {
    const s = seed + i * 107 + 1400;
    const ar = annualResults.find(a => a.fiscalYear === d.fiscalYear);
    const netIncome = ar ? ar.netIncome : 100000;
    const totalDiv = d.dividendPerShare * profile.sharesOutstanding * 1000; // 概算
    const buyback = Math.round(netIncome * seededRandom(s) * 0.3);
    const totalReturn = totalDiv + buyback;
    const totalReturnRatio = netIncome > 0 ? Math.round(totalReturn / netIncome * 1000) / 10 : 0;
    return {
      fiscalYear: d.fiscalYear,
      dividendPerShare: d.dividendPerShare,
      payoutRatio: d.payoutRatio,
      buybackAmount: buyback,
      totalReturnRatio,
      totalReturnAmount: Math.round(totalReturn),
    };
  });

  // --- 株式発行情報 ---
  const issuedShares = profile.sharesOutstanding * 1000000; // 百万株→株
  const treasuryShares = Math.round(issuedShares * vary(0.03, 0.5, seed + 1500));
  const shareIssuance: ShareIssuance = {
    authorizedShares: issuedShares * 3,
    issuedShares,
    treasuryShares,
    outstandingShares: issuedShares - treasuryShares,
    unitShares: 100,
    listingDate: profile.listingDate,
  };

  // --- 大量保有報告 ---
  const LARGE_HOLDER_NAMES = [
    'ブラックロック・ジャパン', 'バンガード・グループ', 'ノルウェー政府年金基金',
    '三井住友信託銀行', '野村アセットマネジメント', 'キャピタル・リサーチ',
    'フィデリティ投信', 'JPモルガン・アセット',
  ];
  const largeHoldings: LargeHolding[] = LARGE_HOLDER_NAMES.slice(0, 4 + Math.floor(seededRandom(seed + 1600) * 4)).map((name, i) => {
    const s = seed + i * 109 + 1600;
    const ratio = Math.round(vary(5, 0.4, s) * 100) / 100;
    const changeTypes: LargeHolding['changeType'][] = ['increase', 'decrease', 'new', 'increase'];
    return {
      holderName: name,
      reportDate: `2024-${String(1 + Math.floor(seededRandom(s + 1) * 12)).padStart(2, '0')}-${String(1 + Math.floor(seededRandom(s + 2) * 28)).padStart(2, '0')}`,
      sharesHeld: Math.round(profile.sharesOutstanding * ratio / 100 * 1000),
      holdingRatio: ratio,
      purpose: '純投資',
      changeType: changeTypes[i % 4],
    };
  });

  // --- 大量保有（被保有） ---
  const TARGET_NAMES = [
    ['デンソー', '7203'], ['KDDI', '9433'], ['東京エレクトロン', '8035'],
    ['日立製作所', '6501'], ['パナソニック', '6752'], ['NEC', '6701'],
  ];
  const largeHoldingTargets: LargeHoldingTarget[] = TARGET_NAMES.slice(0, 2 + Math.floor(seededRandom(seed + 1700) * 3)).map(([name, code], i) => {
    const s = seed + i * 113 + 1700;
    return {
      targetName: name,
      targetCode: code,
      sharesHeld: Math.round(vary(5000, 0.5, s)),
      holdingRatio: Math.round(vary(3, 0.5, s + 1) * 100) / 100,
      bookValue: Math.round(vary(10000, 0.5, s + 2)),
    };
  });

  // --- 自社株買い実績 ---
  const shareBuybacks: ShareBuyback[] = recentYears.slice(-5).map((ar, i) => {
    const s = seed + i * 117 + 1800;
    const acquired = Math.round(vary(profile.sharesOutstanding * 10, 0.5, s));
    return {
      period: ar.fiscalYear,
      sharesAcquired: acquired,
      acquisitionAmount: Math.round(acquired * vary(3, 0.3, s + 1)),
      sharesRetired: Math.round(acquired * seededRandom(s + 2) * 0.5),
      method: '市場買付',
    };
  });

  // --- 株券貸付関連 ---
  const LENDER_NAMES = ['日本証券金融', '野村證券', '大和証券', 'SMBC日興証券'];
  const stockLendings: StockLending[] = LENDER_NAMES.slice(0, 2 + Math.floor(seededRandom(seed + 1900) * 2)).map((lender, i) => {
    const s = seed + i * 121 + 1900;
    return {
      lender,
      sharesLent: Math.round(vary(1000, 0.5, s)),
      lendingFee: Math.round(vary(0.5, 0.4, s + 1) * 100) / 100,
      startDate: `2023-${String(1 + Math.floor(seededRandom(s + 2) * 12)).padStart(2, '0')}-01`,
      endDate: `2024-${String(1 + Math.floor(seededRandom(s + 3) * 12)).padStart(2, '0')}-01`,
    };
  });

  // --- 主要な顧客 ---
  const CUSTOMER_NAMES_MAP: Record<string, string[]> = {
    '7203': ['ディーラー各社', 'レンタカー会社', '官公庁', 'フリート企業'],
    '6758': ['ソニーストア', '家電量販店各社', 'ゲーム販売店', 'ストリーミングパートナー'],
    default: ['主要取引先A', '主要取引先B', '主要取引先C', '主要取引先D'],
  };
  const customerNames = CUSTOMER_NAMES_MAP[stockCode] || CUSTOMER_NAMES_MAP.default;
  const latestRevenue = annualResults[annualResults.length - 1]?.revenue || profile.baseRevenue;
  const majorCustomers: MajorCustomer[] = customerNames.slice(0, 3 + Math.floor(seededRandom(seed + 2000) * 2)).map((name, i) => {
    const s = seed + i * 127 + 2000;
    const ratio = Math.round(vary(15 - i * 3, 0.3, s) * 10) / 10;
    return {
      name,
      salesAmount: Math.round(latestRevenue * ratio / 100),
      salesRatio: ratio,
      segment: profile.segmentNames[i % profile.segmentNames.length],
    };
  });

  // --- 取引先 ---
  const PARTNER_NAMES = [
    { name: '三菱商事', type: 'supplier' as const, desc: '原材料調達' },
    { name: '伊藤忠商事', type: 'supplier' as const, desc: '部品調達' },
    { name: '日本通運', type: 'other' as const, desc: '物流委託' },
    { name: 'NTTデータ', type: 'other' as const, desc: 'ITシステム開発' },
    { name: '電通グループ', type: 'sales' as const, desc: '広告宣伝' },
  ];
  const businessPartners: BusinessPartner[] = PARTNER_NAMES.slice(0, 3 + Math.floor(seededRandom(seed + 2100) * 2)).map((p, i) => {
    const s = seed + i * 131 + 2100;
    return {
      name: p.name,
      type: p.type,
      transactionAmount: Math.round(vary(latestRevenue * 0.03, 0.5, s)),
      description: p.desc,
    };
  });

  // --- 沿革 ---
  const foundedYear = parseInt(profile.founded.replace(/[^0-9]/g, '').slice(0, 4));
  const listingYear = parseInt(profile.listingDate.replace(/[^0-9]/g, '').slice(0, 4));
  const history: CompanyHistoryEvent[] = [
    { year: String(foundedYear), event: `${profile.headquarters}にて設立` },
    { year: String(foundedYear + Math.max(1, Math.floor((listingYear - foundedYear) * 0.3))), event: `${profile.segmentNames[0]}事業を開始` },
    ...(profile.segmentNames.length > 1 ? [{ year: String(foundedYear + Math.max(2, Math.floor((listingYear - foundedYear) * 0.6))), event: `${profile.segmentNames[1]}事業に参入` }] : []),
    { year: String(listingYear), event: '東京証券取引所に上場' },
    { year: String(Math.min(listingYear + 10, 2000)), event: '海外事業を本格展開' },
    { year: String(Math.min(listingYear + 20, 2010)), event: '連結売上高1兆円を突破' },
    { year: String(Math.min(listingYear + 25, 2020)), event: 'ESG経営方針を策定、サステナビリティ委員会設置' },
    { year: '2024', event: '中期経営計画を発表、DX推進強化' },
  ];

  // --- 株主優待 ---
  const hasBenefit = seededRandom(seed + 2200) > 0.3; // 70%の確率で優待あり
  const shareholderBenefits: ShareholderBenefit[] = hasBenefit ? [
    {
      rightsMonth: '3月',
      minimumShares: 100,
      benefitDescription: seededRandom(seed + 2201) > 0.5
        ? '自社グループ商品詰め合わせ（3,000円相当）'
        : 'QUOカード（1,000円分）',
      estimatedValue: seededRandom(seed + 2201) > 0.5 ? 3000 : 1000,
      yieldOnMinimum: 0,
      notes: '1年以上継続保有で長期保有優遇あり',
    },
    ...(seededRandom(seed + 2202) > 0.5 ? [{
      rightsMonth: '9月',
      minimumShares: 500,
      benefitDescription: '自社サービス優待券（5,000円相当）',
      estimatedValue: 5000,
      yieldOnMinimum: 0,
      notes: undefined,
    }] : []),
  ] : [];

  return {
    directors,
    directorCompensation,
    highPaidDirectors,
    auditFees,
    employeeSegments,
    employeeTrends,
    salaryTrends,
    debtRepayment,
    assetLiabilityBreakdown,
    subsidiaries,
    shareholderReturns,
    shareIssuance,
    largeHoldings,
    largeHoldingTargets,
    shareBuybacks,
    stockLendings,
    majorCustomers,
    businessPartners,
    shareholderBenefits,
    history,
  };
}

// ============================================
// 信用取引データ生成
// ============================================

function generateMarginData(stockCode: string, profile: StockProfile): MarginData {
  const seed = hashCode(stockCode + 'margin');
  const baseVolume = Math.round(profile.baseRevenue * 0.8 + 500000);
  const baseDate = new Date('2024-12-01');

  // 共通日付生成（営業日ベース、過去26週分）
  const weeklyDates: string[] = [];
  for (let i = 25; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i * 7);
    if (d.getDay() === 0) d.setDate(d.getDate() - 2);
    if (d.getDay() === 6) d.setDate(d.getDate() - 1);
    weeklyDates.push(d.toISOString().split('T')[0]);
  }
  const dailyDates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0) d.setDate(d.getDate() - 2);
    if (d.getDay() === 6) d.setDate(d.getDate() - 1);
    dailyDates.push(d.toISOString().split('T')[0]);
  }

  // 空売り残高
  let shortBal = Math.round(baseVolume * (0.3 + seededRandom(seed) * 0.2));
  const shortSelling: ShortSellingRecord[] = dailyDates.map((date, i) => {
    const change = Math.round(shortBal * (seededRandom(seed + i * 7 + 1) * 0.1 - 0.05));
    shortBal += change;
    if (shortBal < 10000) shortBal = 10000;
    const vol = Math.round(baseVolume * (0.6 + seededRandom(seed + i * 7 + 2) * 0.8));
    return {
      date,
      shortBalance: shortBal,
      shortRatio: Math.round((shortBal / vol) * 10000) / 100,
      volume: vol,
      changeFromPrev: change,
    };
  });

  // 信用取引（週次）
  let buyBal = Math.round(baseVolume * (1.5 + seededRandom(seed + 100) * 1.0));
  let sellBal = Math.round(buyBal * (0.2 + seededRandom(seed + 101) * 0.3));
  const marginTrading: MarginTradingRecord[] = weeklyDates.map((date, i) => {
    const buyChg = Math.round(buyBal * (seededRandom(seed + i * 5 + 200) * 0.08 - 0.04));
    const sellChg = Math.round(sellBal * (seededRandom(seed + i * 5 + 201) * 0.12 - 0.06));
    buyBal += buyChg;
    sellBal += sellChg;
    if (buyBal < 50000) buyBal = 50000;
    if (sellBal < 5000) sellBal = 5000;
    return {
      date,
      marginBuyBalance: buyBal,
      marginSellBalance: sellBal,
      marginRatio: Math.round((buyBal / sellBal) * 100) / 100,
      buyChange: buyChg,
      sellChange: sellChg,
    };
  });

  // 貸借取引(日証協)（週次）
  let lendBal = Math.round(sellBal * (0.6 + seededRandom(seed + 300) * 0.3));
  let loanBal = Math.round(buyBal * (0.5 + seededRandom(seed + 301) * 0.3));
  const lendingJsda: LendingJsdaRecord[] = weeklyDates.map((date, i) => {
    const lendChg = Math.round(lendBal * (seededRandom(seed + i * 3 + 400) * 0.1 - 0.05));
    const loanChg = Math.round(loanBal * (seededRandom(seed + i * 3 + 401) * 0.1 - 0.05));
    lendBal += lendChg;
    loanBal += loanChg;
    if (lendBal < 3000) lendBal = 3000;
    if (loanBal < 10000) loanBal = 10000;
    return {
      date,
      lendingBalance: lendBal,
      loanBalance: loanBal,
      lendingRatio: Math.round((loanBal / lendBal) * 100) / 100,
      lendingChange: lendChg,
      loanChange: loanChg,
    };
  });

  // 逆日歩（日次）
  const reverseDailyRate: ReverseDailyRecord[] = dailyDates.map((date, i) => {
    const r = seededRandom(seed + i * 11 + 500);
    const applied = r < 0.25;
    return {
      date,
      reverseRate: applied ? Math.round(seededRandom(seed + i * 11 + 501) * 200 + 5) / 100 : 0,
      lendingFeeRate: applied ? Math.round(seededRandom(seed + i * 11 + 502) * 50 + 1) / 10 : 0,
      maxDays: applied ? Math.ceil(seededRandom(seed + i * 11 + 503) * 3) : 0,
      applied,
    };
  });

  // 日証金（日次）
  let jsfLend = Math.round(lendBal * 0.7);
  let jsfLoan = Math.round(loanBal * 0.6);
  const jsfData: JsfRecord[] = dailyDates.map((date, i) => {
    const lendChg = Math.round(jsfLend * (seededRandom(seed + i * 9 + 600) * 0.08 - 0.04));
    const loanChg = Math.round(jsfLoan * (seededRandom(seed + i * 9 + 601) * 0.08 - 0.04));
    jsfLend += lendChg;
    jsfLoan += loanChg;
    if (jsfLend < 1000) jsfLend = 1000;
    if (jsfLoan < 5000) jsfLoan = 5000;
    return {
      date,
      jsfLending: jsfLend,
      jsfLoan: jsfLoan,
      netBalance: jsfLoan - jsfLend,
      jsfLendingChange: lendChg,
      jsfLoanChange: loanChg,
    };
  });

  // 需給分析
  const latestMargin = marginTrading[marginTrading.length - 1];
  const latestShort = shortSelling[shortSelling.length - 1];
  const daysTocover = latestShort.volume > 0 ? Math.round((latestShort.shortBalance / latestShort.volume) * 100) / 100 : 0;
  const ratioTrend = (() => {
    const recent5 = marginTrading.slice(-5);
    const old5 = marginTrading.slice(-10, -5);
    if (old5.length === 0) return 'stable' as const;
    const recentAvg = recent5.reduce((s, m) => s + m.marginRatio, 0) / recent5.length;
    const oldAvg = old5.reduce((s, m) => s + m.marginRatio, 0) / old5.length;
    if (recentAvg > oldAvg * 1.1) return 'deteriorating' as const;
    if (recentAvg < oldAvg * 0.9) return 'improving' as const;
    return 'stable' as const;
  })();
  const scoreSeed = seededRandom(seed + 999);
  const rawScore = Math.round((scoreSeed * 200 - 100));
  const signal = rawScore > 40 ? 'strong_buy' as const
    : rawScore > 15 ? 'buy' as const
    : rawScore > -15 ? 'neutral' as const
    : rawScore > -40 ? 'sell' as const
    : 'strong_sell' as const;
  const sqRisk = daysTocover > 5 ? 'high' as const : daysTocover > 2 ? 'medium' as const : 'low' as const;

  const signalText = { strong_buy: '強い買い優勢', buy: '買い優勢', neutral: '中立', sell: '売り優勢', strong_sell: '強い売り優勢' };
  const trendText = { improving: '改善傾向', stable: '横ばい', deteriorating: '悪化傾向' };
  const riskText = { high: '高', medium: '中', low: '低' };

  const supplyDemand: SupplyDemandAnalysis = {
    score: rawScore,
    signal,
    marginRatioTrend: ratioTrend,
    shortSqueezeRisk: sqRisk,
    daysTocover,
    costOfBorrow: Math.round(seededRandom(seed + 888) * 300 + 10) / 100,
    summary: `信用倍率${latestMargin.marginRatio.toFixed(1)}倍（${trendText[ratioTrend]}）。空売り比率${latestShort.shortRatio.toFixed(1)}%、回転日数${daysTocover.toFixed(1)}日。踏み上げリスク${riskText[sqRisk]}。需給は${signalText[signal]}の状態。${
      signal === 'strong_buy' || signal === 'buy'
        ? '売り方の買い戻し圧力が強まる可能性。'
        : signal === 'strong_sell' || signal === 'sell'
        ? '信用買い残の整理が進む必要あり。'
        : '方向感に乏しい需給環境。'
    }`,
  };

  return { shortSelling, marginTrading, lendingJsda, reverseDailyRate, jsfData, supplyDemand };
}

// ============================================
// ニュース・IR・決算発表データ生成
// ============================================

function generateCompanyNews(stockCode: string, profile: StockProfile, annualResults: AnnualResult[]): CompanyNews[] {
  const seed = hashCode(stockCode + 'news');
  const latestFY = annualResults[annualResults.length - 1]?.fiscalYear || '2024/3';
  const name = profile.name;
  const seg0 = profile.segmentNames[0] || '主力事業';
  const seg1 = profile.segmentNames.length > 1 ? profile.segmentNames[1] : '新規事業';

  const earningsNews: CompanyNews[] = [
    { id: `${stockCode}-e1`, date: '2024-12-15', title: `${name}、${latestFY}期 第2四半期決算を発表　営業利益は前年同期比${Math.round(10 + seededRandom(seed + 1) * 20)}%増`, source: '適時開示', category: 'earnings' },
    { id: `${stockCode}-e2`, date: '2024-08-10', title: `${name}、${latestFY}期 第1四半期決算　売上高は計画通りに推移`, source: '適時開示', category: 'earnings' },
    { id: `${stockCode}-e3`, date: '2024-05-12', title: `${name}、前期本決算を発表　通期営業利益は過去最高を更新`, source: '適時開示', category: 'earnings' },
    { id: `${stockCode}-e4`, date: '2024-02-08', title: `${name}、第3四半期決算を発表　通期業績予想を上方修正`, source: '適時開示', category: 'earnings' },
  ];

  const irNews: CompanyNews[] = [
    { id: `${stockCode}-i1`, date: '2024-12-20', title: `${name}、自己株式の取得状況に関するお知らせ（12月）`, source: 'IR', category: 'ir' },
    { id: `${stockCode}-i2`, date: '2024-11-28', title: `${name}、中期経営計画のアップデートを発表`, source: 'IR', category: 'ir' },
    { id: `${stockCode}-i3`, date: '2024-11-15', title: `${name}、サステナビリティレポート2024を公開`, source: 'IR', category: 'ir' },
    { id: `${stockCode}-i4`, date: '2024-10-30', title: `${name}、株主還元方針の変更に関するお知らせ　配当性向目標を${Math.round(30 + seededRandom(seed + 10) * 20)}%に引上げ`, source: 'IR', category: 'ir' },
    { id: `${stockCode}-i5`, date: '2024-09-15', title: `${name}、コーポレートガバナンス報告書を更新`, source: 'IR', category: 'ir' },
  ];

  const generalNews: CompanyNews[] = [
    { id: `${stockCode}-n1`, date: '2024-12-22', title: `${name}、${seg0}分野で新技術を発表　市場シェア拡大へ`, source: '日経新聞', category: 'news' },
    { id: `${stockCode}-n2`, date: '2024-12-18', title: `${name}の株価が年初来高値を更新　好業績を評価`, source: 'Bloomberg', category: 'news' },
    { id: `${stockCode}-n3`, date: '2024-12-10', title: `${name}、${seg1}領域で海外企業と戦略的提携`, source: 'Reuters', category: 'news' },
    { id: `${stockCode}-n4`, date: '2024-11-25', title: `${name}、DX推進加速のため新子会社を設立`, source: '日経新聞', category: 'news' },
    { id: `${stockCode}-n5`, date: '2024-11-08', title: `${profile.headquarters}の${name}本社ビル、環境認証を取得`, source: '日刊工業新聞', category: 'news' },
  ];

  const analystNews: CompanyNews[] = [
    { id: `${stockCode}-a1`, date: '2024-12-19', title: `${name}のレーティングを「買い」に引上げ　目標株価${Math.round(seededRandom(seed + 20) * 3000 + 5000)}円`, source: 'みずほ証券', category: 'analyst' },
    { id: `${stockCode}-a2`, date: '2024-12-05', title: `${name}：${seg0}の成長性を評価　「Outperform」を維持`, source: '野村證券', category: 'analyst' },
    { id: `${stockCode}-a3`, date: '2024-11-20', title: `${name}、業績モメンタムは継続　「中立」→「やや強気」に変更`, source: '大和証券', category: 'analyst' },
  ];

  return [...earningsNews, ...irNews, ...generalNews, ...analystNews]
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ============================================
// IR/開示情報 生成
// ============================================

function generateIrDisclosure(stockCode: string, profile: StockProfile, annualResults: AnnualResult[]): IrDisclosureData {
  const seed = parseInt(stockCode) || 7203;
  const rng = (i: number) => ((seed * 31 + i * 17) % 1000) / 1000;
  const name = profile.name;
  const fiscalYears = annualResults.map(a => a.fiscalYear).slice(-10);

  // --- 開示書類 ---
  const documents: DisclosureDocument[] = [];
  let docId = 0;
  for (const fy of fiscalYears) {
    const yr = parseInt(fy.split('/')[0]) || 2024;
    // 有報
    documents.push({
      id: `doc-${docId++}`, date: `${yr}-06-${20 + Math.floor(rng(docId) * 8)}`, fiscalYear: fy,
      type: 'yuho', title: `${fy}期 有価証券報告書`, pages: 120 + Math.floor(rng(docId) * 60),
    });
    // 決算短信（通期）
    documents.push({
      id: `doc-${docId++}`, date: `${yr}-05-${8 + Math.floor(rng(docId) * 5)}`, fiscalYear: fy,
      type: 'tanshin', title: `${fy}期 決算短信〔IFRS〕（連結）`, pages: 28 + Math.floor(rng(docId) * 10),
    });
    // 内部統制
    documents.push({
      id: `doc-${docId++}`, date: `${yr}-06-${20 + Math.floor(rng(docId) * 8)}`, fiscalYear: fy,
      type: 'naibu', title: `${fy}期 内部統制報告書`, pages: 4,
    });
    // 臨時報告書（一部の年度のみ）
    if (rng(docId + 100) > 0.4) {
      documents.push({
        id: `doc-${docId++}`, date: `${yr}-0${3 + Math.floor(rng(docId) * 6)}-${10 + Math.floor(rng(docId) * 15)}`, fiscalYear: fy,
        type: 'rinji', title: `臨時報告書（${['代表取締役の異動', '主要株主の異動', '重要な訴訟の提起', '親会社の異動'][Math.floor(rng(docId) * 4)]})`,
      });
    }
    // 3Q短信
    documents.push({
      id: `doc-${docId++}`, date: `${yr}-02-${5 + Math.floor(rng(docId) * 5)}`, fiscalYear: fy,
      type: 'tanshin', title: `${fy}期 第3四半期決算短信〔IFRS〕（連結）`, pages: 18 + Math.floor(rng(docId) * 5),
    });
    // 2Q短信
    documents.push({
      id: `doc-${docId++}`, date: `${yr - 1}-11-${1 + Math.floor(rng(docId) * 8)}`, fiscalYear: fy,
      type: 'tanshin', title: `${fy}期 第2四半期決算短信〔IFRS〕（連結）`, pages: 20 + Math.floor(rng(docId) * 5),
    });
    // 1Q短信
    documents.push({
      id: `doc-${docId++}`, date: `${yr - 1}-08-${1 + Math.floor(rng(docId) * 8)}`, fiscalYear: fy,
      type: 'tanshin', title: `${fy}期 第1四半期決算短信〔IFRS〕（連結）`, pages: 16 + Math.floor(rng(docId) * 5),
    });
    // 資料情報
    documents.push({
      id: `doc-${docId++}`, date: `${yr}-05-${8 + Math.floor(rng(docId) * 5)}`, fiscalYear: fy,
      type: 'shiryou', title: `${fy}期 決算説明資料`, pages: 40 + Math.floor(rng(docId) * 20),
    });
  }
  documents.sort((a, b) => b.date.localeCompare(a.date));

  // --- 提出スケジュール ---
  const filingSchedule: FilingScheduleRow[] = fiscalYears.map((fy, i) => {
    const yr = parseInt(fy.split('/')[0]) || 2024;
    const tanshinDay = 8 + Math.floor(rng(i * 3) * 5);
    const yuhoDay = 20 + Math.floor(rng(i * 3 + 1) * 8);
    return {
      fiscalYear: fy,
      fiscalEnd: `${yr}-03-31`,
      tanshinDate: `${yr}-05-${String(tanshinDay).padStart(2, '0')}`,
      yuhoDate: `${yr}-06-${String(yuhoDay).padStart(2, '0')}`,
      daysToYuho: 80 + yuhoDay,
      tanshinToYuho: 30 + yuhoDay - tanshinDay,
    };
  }).reverse();

  // --- 決算短信業績＆配当予想 ---
  const tanshinEarnings: TanshinEarnings[] = [];
  for (const ar of annualResults.slice(-10)) {
    const rev = ar.revenue;
    const oi = ar.operatingIncome;
    const ni = ar.netIncome;
    tanshinEarnings.push({
      fiscalYear: ar.fiscalYear, period: '通期',
      revenue: rev, operatingIncome: oi, ordinaryIncome: Math.round(oi * 1.02),
      netIncome: ni, eps: Math.round(ni / 15 * 10) / 10,
      dividendForecast: 25 + Math.floor(rng(tanshinEarnings.length) * 50),
      dividendActual: 25 + Math.floor(rng(tanshinEarnings.length + 50) * 50),
      payoutRatio: 20 + Math.floor(rng(tanshinEarnings.length + 100) * 30),
    });
    // 2Q累計
    tanshinEarnings.push({
      fiscalYear: ar.fiscalYear, period: '2Q累計',
      revenue: Math.round(rev * (0.46 + rng(tanshinEarnings.length) * 0.08)),
      operatingIncome: Math.round(oi * (0.44 + rng(tanshinEarnings.length) * 0.12)),
      ordinaryIncome: Math.round(oi * 1.02 * (0.44 + rng(tanshinEarnings.length) * 0.12)),
      netIncome: Math.round(ni * (0.42 + rng(tanshinEarnings.length) * 0.16)),
      eps: Math.round(ni * (0.42 + rng(tanshinEarnings.length) * 0.16) / 15 * 10) / 10,
      dividendForecast: 12 + Math.floor(rng(tanshinEarnings.length + 200) * 25),
    });
  }
  tanshinEarnings.reverse();

  // --- 業績修正 ---
  const earningsRevisions: EarningsRevision[] = [];
  for (let i = 0; i < Math.min(6, fiscalYears.length); i++) {
    const fy = fiscalYears[fiscalYears.length - 1 - i];
    if (rng(i * 7) > 0.35) {
      const yr = parseInt(fy.split('/')[0]) || 2024;
      const before = 2000000 + Math.floor(rng(i * 11) * 1000000);
      const rate = -15 + Math.floor(rng(i * 13) * 30);
      const after = Math.round(before * (1 + rate / 100));
      earningsRevisions.push({
        date: `${yr}-0${1 + Math.floor(rng(i * 9) * 3)}-${10 + Math.floor(rng(i * 14) * 15)}`,
        fiscalYear: fy,
        item: ['売上高', '営業利益', '経常利益', '純利益'][Math.floor(rng(i * 15) * 4)],
        beforeValue: before, afterValue: after, changeRate: rate,
        reason: ['為替の影響', '原材料費の高騰', '販売好調', '一時的な損失計上', '構造改革費用'][Math.floor(rng(i * 16) * 5)],
      });
    }
  }

  // --- 有報詳細項目 ---
  const recentFYs = fiscalYears.slice(-5);
  const yuhoDetails: YuhoDetailItem[] = [
    { category: '従業員', label: '従業員数（連結）', unit: '人',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 350000 + Math.floor(rng(i) * 30000) })) },
    { category: '従業員', label: '従業員数（単体）', unit: '人',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 70000 + Math.floor(rng(i + 10) * 5000) })) },
    { category: '従業員', label: '平均年齢', unit: '歳',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: (39.5 + rng(i + 20) * 2).toFixed(1) })) },
    { category: '従業員', label: '平均勤続年数', unit: '年',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: (15.0 + rng(i + 30) * 3).toFixed(1) })) },
    { category: '従業員', label: '平均年間給与', unit: '千円',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 8000 + Math.floor(rng(i + 40) * 1000) })) },
    { category: '設備投資', label: '設備投資額', unit: '百万円',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 1200000 + Math.floor(rng(i + 50) * 500000) })) },
    { category: '設備投資', label: '減価償却費', unit: '百万円',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 900000 + Math.floor(rng(i + 60) * 300000) })) },
    { category: '研究開発', label: '研究開発費', unit: '百万円',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 1000000 + Math.floor(rng(i + 70) * 200000) })) },
    { category: '研究開発', label: '研究開発費率', unit: '%',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: (2.5 + rng(i + 80) * 1.5).toFixed(1) })) },
    { category: '株式', label: '発行済株式数', unit: '千株',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 16314987 - i * Math.floor(rng(i + 90) * 100000) })) },
    { category: '株式', label: '自己株式数', unit: '千株',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 2800000 + Math.floor(rng(i + 100) * 400000) })) },
    { category: '配当', label: '1株当たり配当金', unit: '円',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 28 + Math.floor(rng(i + 110) * 50) })) },
    { category: '配当', label: '配当性向', unit: '%',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: (25 + rng(i + 120) * 20).toFixed(1) })) },
    { category: 'その他', label: '監査報酬', unit: '百万円',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 1500 + Math.floor(rng(i + 130) * 500) })) },
    { category: 'その他', label: '非監査報酬', unit: '百万円',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, value: 200 + Math.floor(rng(i + 140) * 200) })) },
  ];

  // --- 勘定科目 ---
  const accountItems: AccountItem[] = [
    // BS
    { code: 'A101', name: '現金及び預金', category: 'bs', subcategory: '流動資産',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 5000000 + Math.floor(rng(i) * 2000000) })), unit: '百万円' },
    { code: 'A102', name: '受取手形及び売掛金', category: 'bs', subcategory: '流動資産',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 3000000 + Math.floor(rng(i + 5) * 1000000) })), unit: '百万円' },
    { code: 'A103', name: '棚卸資産', category: 'bs', subcategory: '流動資産',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 3500000 + Math.floor(rng(i + 10) * 800000) })), unit: '百万円' },
    { code: 'A201', name: '有形固定資産', category: 'bs', subcategory: '固定資産',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 11000000 + Math.floor(rng(i + 15) * 2000000) })), unit: '百万円' },
    { code: 'A202', name: '無形固定資産', category: 'bs', subcategory: '固定資産',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 1200000 + Math.floor(rng(i + 20) * 300000) })), unit: '百万円' },
    { code: 'A203', name: '投資有価証券', category: 'bs', subcategory: '固定資産',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 8000000 + Math.floor(rng(i + 25) * 3000000) })), unit: '百万円' },
    { code: 'L101', name: '支払手形及び買掛金', category: 'bs', subcategory: '流動負債',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 4000000 + Math.floor(rng(i + 30) * 800000) })), unit: '百万円' },
    { code: 'L102', name: '短期借入金', category: 'bs', subcategory: '流動負債',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 3000000 + Math.floor(rng(i + 35) * 1000000) })), unit: '百万円' },
    { code: 'L201', name: '長期借入金', category: 'bs', subcategory: '固定負債',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 8000000 + Math.floor(rng(i + 40) * 2000000) })), unit: '百万円' },
    { code: 'L202', name: '社債', category: 'bs', subcategory: '固定負債',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 5000000 + Math.floor(rng(i + 45) * 1500000) })), unit: '百万円' },
    // PL
    { code: 'P101', name: '売上高', category: 'pl', subcategory: '売上',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 30000000 + Math.floor(rng(i + 50) * 8000000) })), unit: '百万円' },
    { code: 'P102', name: '売上原価', category: 'pl', subcategory: '売上',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 24000000 + Math.floor(rng(i + 55) * 6000000) })), unit: '百万円' },
    { code: 'P103', name: '販売費及び一般管理費', category: 'pl', subcategory: '費用',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 3000000 + Math.floor(rng(i + 60) * 500000) })), unit: '百万円' },
    { code: 'P104', name: '営業利益', category: 'pl', subcategory: '利益',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 2500000 + Math.floor(rng(i + 65) * 1500000) })), unit: '百万円' },
    { code: 'P105', name: '経常利益', category: 'pl', subcategory: '利益',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 3000000 + Math.floor(rng(i + 70) * 1500000) })), unit: '百万円' },
    { code: 'P106', name: '当期純利益', category: 'pl', subcategory: '利益',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 2000000 + Math.floor(rng(i + 75) * 1200000) })), unit: '百万円' },
    // CF
    { code: 'C101', name: '営業活動によるCF', category: 'cf', subcategory: '営業CF',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 3500000 + Math.floor(rng(i + 80) * 1500000) })), unit: '百万円' },
    { code: 'C102', name: '投資活動によるCF', category: 'cf', subcategory: '投資CF',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: -(2500000 + Math.floor(rng(i + 85) * 1000000)) })), unit: '百万円' },
    { code: 'C103', name: '財務活動によるCF', category: 'cf', subcategory: '財務CF',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: -(800000 + Math.floor(rng(i + 90) * 800000)) })), unit: '百万円' },
    { code: 'C104', name: 'フリーCF', category: 'cf', subcategory: '営業CF',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 1000000 + Math.floor(rng(i + 95) * 800000) })), unit: '百万円' },
  ];

  // --- IFRS財務諸表要約 ---
  const ifrsSummary: IFRSSummaryRow[] = [
    { label: '売上収益', isBold: true,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 33000000 + Math.floor(rng(i + 200) * 8000000) })) },
    { label: '売上原価', indent: 1,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: -(26000000 + Math.floor(rng(i + 205) * 6000000)) })) },
    { label: '売上総利益', isBold: true,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 7000000 + Math.floor(rng(i + 210) * 2000000) })) },
    { label: '販売費及び一般管理費', indent: 1,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: -(3200000 + Math.floor(rng(i + 215) * 500000)) })) },
    { label: '営業利益', isBold: true,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 3000000 + Math.floor(rng(i + 220) * 2000000) })) },
    { label: '金融収益', indent: 1,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 500000 + Math.floor(rng(i + 225) * 300000) })) },
    { label: '金融費用', indent: 1,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: -(200000 + Math.floor(rng(i + 230) * 100000)) })) },
    { label: '持分法による投資利益', indent: 1,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 300000 + Math.floor(rng(i + 235) * 200000) })) },
    { label: '税引前利益', isBold: true,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 3500000 + Math.floor(rng(i + 240) * 2500000) })) },
    { label: '法人所得税費用', indent: 1,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: -(900000 + Math.floor(rng(i + 245) * 600000)) })) },
    { label: '当期利益', isBold: true,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 2500000 + Math.floor(rng(i + 250) * 1800000) })) },
    { label: '親会社の所有者に帰属する当期利益', isBold: true,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 2200000 + Math.floor(rng(i + 255) * 1600000) })) },
    { label: '基本的1株当たり当期利益（円）',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: Math.round((2200000 + Math.floor(rng(i + 255) * 1600000)) / 14000 * 10) / 10 })) },
    { label: 'その他の包括利益合計',
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 800000 + Math.floor(rng(i + 260) * 1000000) - 500000 })) },
    { label: '当期包括利益合計', isBold: true,
      values: recentFYs.map((fy, i) => ({ fiscalYear: fy, amount: 3000000 + Math.floor(rng(i + 265) * 2000000) })) },
  ];

  // --- 有報セクション（事業の状況・経理の状況 等） ---
  const latestFY = recentFYs[recentFYs.length - 1] || '2024/3';
  const yuhoSections: YuhoSection[] = [
    { sectionId: 'biz-overview', category: '事業の状況', title: '事業の内容', excerpt: `${name}グループは、当社及び連結子会社で構成されており…`, fiscalYear: latestFY },
    { sectionId: 'biz-risk', category: '事業の状況', title: '事業等のリスク', excerpt: '当社グループの経営成績に影響を及ぼす可能性のあるリスクとして…', fiscalYear: latestFY },
    { sectionId: 'biz-md&a', category: '事業の状況', title: '経営者による財政状態、経営成績及びキャッシュ・フローの状況の分析', excerpt: '当連結会計年度における世界経済は、各国の金融政策や地政学的リスク…', fiscalYear: latestFY },
    { sectionId: 'biz-rd', category: '事業の状況', title: '研究開発活動', excerpt: `当連結会計年度における研究開発費は${1000 + Math.floor(rng(300) * 200)}百万円…`, fiscalYear: latestFY },
    { sectionId: 'biz-capex', category: '事業の状況', title: '設備投資等の概要', excerpt: `当連結会計年度の設備投資額は${1200 + Math.floor(rng(301) * 500)}百万円…`, fiscalYear: latestFY },
    { sectionId: 'gov-officers', category: 'コーポレート・ガバナンス', title: '役員の状況', excerpt: '取締役及び監査役の氏名、地位、担当、重要な兼職の状況…', fiscalYear: latestFY },
    { sectionId: 'gov-comp', category: 'コーポレート・ガバナンス', title: '役員の報酬等', excerpt: '役員区分ごとの報酬等の総額、報酬等の種類別の総額…', fiscalYear: latestFY },
    { sectionId: 'gov-audit', category: 'コーポレート・ガバナンス', title: '監査の状況', excerpt: '監査法人の名称、監査報酬、非監査業務の内容…', fiscalYear: latestFY },
    { sectionId: 'fin-pl', category: '経理の状況', title: '連結損益計算書', excerpt: '売上収益、売上原価、販売費及び一般管理費…', fiscalYear: latestFY },
    { sectionId: 'fin-bs', category: '経理の状況', title: '連結貸借対照表', excerpt: '流動資産、固定資産、流動負債、固定負債、純資産…', fiscalYear: latestFY },
    { sectionId: 'fin-cf', category: '経理の状況', title: '連結キャッシュ・フロー計算書', excerpt: '営業活動、投資活動、財務活動によるキャッシュ・フロー…', fiscalYear: latestFY },
    { sectionId: 'fin-equity', category: '経理の状況', title: '連結株主資本等変動計算書', excerpt: '株主資本、その他の包括利益累計額の変動…', fiscalYear: latestFY },
    { sectionId: 'shareholder', category: '株式等の状況', title: '大株主の状況', excerpt: '所有株式数の多い順に上位10名の株主…', fiscalYear: latestFY },
    { sectionId: 'dividend', category: '株式等の状況', title: '配当政策', excerpt: '安定的な配当の維持・向上を基本方針とし…', fiscalYear: latestFY },
  ];

  // --- 有報注記ブロック（詳細テキスト） ---
  const yuhoNoteBlocks: YuhoNoteBlock[] = [
    { blockId: 'InformationAboutOfficersTextBlock', title: '役員の状況', content: `【取締役】\n代表取締役社長 山田太郎（${55 + Math.floor(rng(310) * 10)}歳）\n  略歴：${1990 + Math.floor(rng(311) * 5)}年当社入社。${2010 + Math.floor(rng(312) * 5)}年取締役就任。${2018 + Math.floor(rng(313) * 3)}年代表取締役社長就任（現任）。\n\n取締役副社長 鈴木次郎（${52 + Math.floor(rng(314) * 8)}歳）\n  略歴：${1992 + Math.floor(rng(315) * 5)}年当社入社。経営企画部門を統括。\n\n社外取締役 佐藤花子（${50 + Math.floor(rng(316) * 12)}歳）\n  略歴：弁護士。企業法務に精通。`, fiscalYear: latestFY },
    { blockId: 'BusinessRiskTextBlock', title: '事業等のリスク', content: `当社グループの経営成績、財政状態等に影響を及ぼす可能性があると考えられる主なリスクは以下のとおりです。\n\n1. 経済環境リスク\n世界経済の変動、特に主要市場における景気後退は、当社製品・サービスの需要に影響を与える可能性があります。\n\n2. 為替変動リスク\n当社グループの海外売上高比率は約${40 + Math.floor(rng(320) * 20)}%であり、為替レートの変動は業績に影響します。\n\n3. 原材料価格の変動\n主要原材料の価格高騰は、製造コストの上昇を通じて利益率に影響を与える可能性があります。`, fiscalYear: latestFY },
    { blockId: 'MDATextBlock', title: '経営者による分析', content: `当連結会計年度における世界経済は、各国における金融引き締め政策の影響が続く中、緩やかな回復基調で推移しました。\n\n【経営成績の分析】\n売上収益は、主力事業の堅調な推移により前年同期比増収となりました。営業利益は、増収効果に加え、原価低減活動の成果もあり増益となりました。\n\n【財政状態の分析】\n総資産は前期末に比べ増加しました。これは主に、設備投資に伴う有形固定資産の増加によるものです。`, fiscalYear: latestFY },
    { blockId: 'RDActivitiesTextBlock', title: '研究開発活動', content: `当社グループは技術革新による競争力の強化を重要課題と位置づけ、研究開発活動を積極的に推進しています。\n\n当連結会計年度における研究開発費の総額は${1000 + Math.floor(rng(330) * 200)}百万円です。\n\n主な研究開発テーマ：\n・次世代製品の開発\n・製造プロセスの高度化\n・DX推進に向けたデジタル技術の活用\n・カーボンニュートラルに向けた環境技術`, fiscalYear: latestFY },
    { blockId: 'DividendPolicyTextBlock', title: '配当政策', content: `当社は、株主の皆様への利益還元を経営の重要課題の一つと位置づけ、安定的な配当の維持・向上を基本方針としています。\n\n配当性向の目標は${25 + Math.floor(rng(340) * 15)}%以上とし、内部留保資金については成長投資や財務体質の強化に充当してまいります。\n\n当期の1株当たり配当金は${30 + Math.floor(rng(341) * 40)}円（前期比${2 + Math.floor(rng(342) * 8)}円増配）を予定しています。`, fiscalYear: latestFY },
    { blockId: 'AuditFeeTextBlock', title: '監査報酬の内容等', content: `当社の会計監査人である○○監査法人に対する報酬は以下のとおりです。\n\n監査証明業務に基づく報酬額：${150 + Math.floor(rng(350) * 50)}百万円\n非監査業務に基づく報酬額：${20 + Math.floor(rng(351) * 30)}百万円\n\n非監査業務の内容：アドバイザリー業務、IFRS導入支援業務等`, fiscalYear: latestFY },
  ];

  return {
    documents,
    filingSchedule,
    tanshinEarnings,
    earningsRevisions,
    yuhoDetails,
    accountItems,
    ifrsSummary,
    yuhoSections,
    yuhoNoteBlocks,
  };
}
