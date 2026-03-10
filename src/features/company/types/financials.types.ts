// ============================================
// 企業サマリー（ヘッダー表示用）
// ============================================

export interface CompanySummary {
  stockCode: string;
  stockName: string;
  market: 'Prime' | 'Standard' | 'Growth';
  sector: string;
  industry: string;
  marketCap: number;       // 時価総額（億円）
  per: number;             // PER（倍）
  pbr: number;             // PBR（倍）
  dividendYield: number;   // 配当利回り（%）
  roe: number;             // ROE（%）
  roa: number;             // ROA（%）
  currentPrice: number;    // 現在株価（円）
  priceChange?: number;       // 前日比（%）
  priceChangeAmount?: number; // 前日比（円）
}

// ============================================
// 企業概要
// ============================================

export interface CompanyProfile {
  description: string;           // 特色/事業概要
  mission: string;               // ミッション
  vision: string;                // ビジョン
  industryPosition: string;      // 業界内ポジション（一文）
  founded: string;               // 設立年月
  employees: number;             // 従業員数
  averageSalary: number;         // 平均年収（万円）
  averageAge: number;            // 平均年齢
  headquarters: string;          // 本社所在地
  ceo: string;                   // 代表取締役
  fiscalYearEnd: string;         // 決算月
  listingDate: string;           // 上場年月
  url: string;                   // 企業URL
}

// ============================================
// 株価データ
// ============================================

export interface StockPricePoint {
  date: string;                  // "2024-01-15" ISO形式
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;                // 出来高
}

// ============================================
// セグメント構成
// ============================================

export interface BusinessSegment {
  name: string;
  revenue: number;               // セグメント売上（百万円）
  operatingIncome: number;       // セグメント営業利益
  percentage: number;            // 売上構成比（%）
  color: string;                 // チャート用色コード
}

// ============================================
// 大株主情報
// ============================================

export interface Shareholder {
  name: string;
  shares: number;                // 保有株数（千株）
  percentage: number;            // 保有比率（%）
  type: 'institution' | 'bank' | 'insurance' | 'trust' | 'foreign' | 'individual' | 'treasury';
}

// ============================================
// 業績予想
// ============================================

export interface EarningsForecast {
  fiscalYear: string;            // "2025/3"
  revenueEstimate: number;
  operatingIncomeEstimate: number;
  ordinaryIncomeEstimate: number;
  netIncomeEstimate: number;
  epsEstimate: number;
  dividendEstimate: number;
  revenueYoY: number;
  operatingIncomeYoY: number;
  netIncomeYoY: number;
  source: 'company' | 'consensus';
}

// ============================================
// 四季報コメント
// ============================================

export interface ShikihoCommentary {
  headline: string;              // 見出し ("【連続最高益】")
  body: string;                  // 本文
  outlook: 'positive' | 'neutral' | 'cautious';
  updatedAt: string;
}

// ============================================
// カテゴリ別指標ダッシュボード
// ============================================

export interface MetricsDashboard {
  profitability: {
    operatingMargin: number;
    netMargin: number;
    roe: number;
    roa: number;
    roic: number;
  };
  growth: {
    revenueGrowth3Y: number;
    operatingIncomeGrowth3Y: number;
    epsGrowth3Y: number;
    revenueCAGR5Y: number;
  };
  stability: {
    equityRatio: number;
    currentRatio: number;
    interestCoverageRatio: number;
    debtToEquityRatio: number;
    netDebtToEquityRatio: number;
  };
  valuation: {
    per: number;
    pbr: number;
    pcfr: number;
    evToEbitda: number;
    dividendYield: number;
  };
}

// ============================================
// 一株指標推移
// ============================================

export interface PerShareMetrics {
  fiscalYear: string;
  eps: number;
  bps: number;
  dps: number;
  cfps: number;
}

// ============================================
// 業績（年次）
// ============================================

export interface AnnualResult {
  fiscalYear: string;       // "2024/3" 形式
  revenue: number;          // 売上高（百万円）
  operatingIncome: number;  // 営業利益
  ordinaryIncome: number;   // 経常利益
  netIncome: number;        // 純利益
  comprehensiveIncome: number; // 包括利益（百万円）
  eps: number;              // EPS（円）
  roe: number;              // ROE（%）
  roa: number;              // ROA（%）
  operatingMargin: number;  // 営業利益率（%）
  costRatio: number;        // 原価率（%）
  sgaRatio: number;         // 販管費率（%）
  revenueYoY?: number;
  operatingIncomeYoY?: number;
  netIncomeYoY?: number;
}

// ============================================
// 四半期
// ============================================

export interface QuarterlyResult {
  period: string;           // "2024/3 1Q" 形式
  revenue: number;
  operatingIncome: number;
  ordinaryIncome: number;
  netIncome: number;
  revenueYoY?: number;
  operatingIncomeYoY?: number;
}

// ============================================
// 財務（BS）
// ============================================

export interface BalanceSheet {
  fiscalYear: string;
  totalAssets: number;          // 総資産（百万円）
  netAssets: number;            // 純資産
  shareholdersEquity: number;   // 株主資本
  equityRatio: number;          // 自己資本比率（%）
  retainedEarnings: number;     // 利益剰余金
  interestBearingDebt: number;  // 有利子負債
  debtRatio: number;            // 有利子負債比率（%）
  bps: number;                  // BPS（円）
}

// ============================================
// キャッシュフロー
// ============================================

export interface CashFlow {
  fiscalYear: string;
  operatingCF: number;          // 営業CF（百万円）
  investingCF: number;          // 投資CF
  financingCF: number;          // 財務CF
  freeCF: number;               // フリーCF
  capex: number;                // 設備投資（百万円、負値）
  cashAndEquivalents: number;   // 現金等
  operatingCFMargin: number;    // 営業CFマージン（%）
}

// ============================================
// 配当
// ============================================

export interface DividendData {
  fiscalYear: string;
  dividendPerShare: number;     // 一株配当（円）
  payoutRatio: number;          // 配当性向（%）
  dividendYield: number;        // 配当利回り（%）
  surplusDistribution: number;  // 剰余金の配当（百万円）
  netAssetDividendRate: number; // 純資産配当率（%）
  shareBuyback: number;         // 自社株買い（百万円）
  totalReturn: number;          // 総還元額（百万円）
  totalReturnRatio: number;     // 総還元性向（%）
}

// ============================================
// 統合型
// ============================================

// ============================================
// 信用取引データ
// ============================================

export interface ShortSellingRecord {
  date: string;
  shortBalance: number;       // 空売り残高（株）
  shortRatio: number;          // 空売り比率（%）
  volume: number;              // 出来高（株）
  changeFromPrev: number;      // 前日比（株）
}

export interface MarginTradingRecord {
  date: string;
  marginBuyBalance: number;    // 信用買残（株）
  marginSellBalance: number;   // 信用売残（株）
  marginRatio: number;         // 貸借倍率（倍）
  buyChange: number;           // 買残前週比（株）
  sellChange: number;          // 売残前週比（株）
}

export interface LendingJsdaRecord {
  date: string;
  lendingBalance: number;      // 貸株残（株）
  loanBalance: number;         // 融資残（株）
  lendingRatio: number;        // 貸借倍率（倍）
  lendingChange: number;       // 貸株前週比（株）
  loanChange: number;          // 融資前週比（株）
}

export interface ReverseDailyRecord {
  date: string;
  reverseRate: number;         // 逆日歩（円）
  lendingFeeRate: number;      // 品貸料率（銭）
  maxDays: number;             // 最高日数
  applied: boolean;            // 発生有無
}

export interface JsfRecord {
  date: string;
  jsfLending: number;          // 貸株残（株）
  jsfLoan: number;             // 融資残（株）
  netBalance: number;          // 差引残（株）
  jsfLendingChange: number;    // 貸株前日比（株）
  jsfLoanChange: number;       // 融資前日比（株）
}

export interface SupplyDemandAnalysis {
  score: number;                         // 需給スコア（-100〜+100）
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  marginRatioTrend: 'improving' | 'stable' | 'deteriorating';
  shortSqueezeRisk: 'high' | 'medium' | 'low';
  daysTocover: number;                   // 回転日数
  costOfBorrow: number;                  // 貸株料率（%）
  summary: string;                       // 分析サマリー
}

export interface MarginData {
  shortSelling: ShortSellingRecord[];
  marginTrading: MarginTradingRecord[];
  lendingJsda: LendingJsdaRecord[];
  reverseDailyRate: ReverseDailyRecord[];
  jsfData: JsfRecord[];
  supplyDemand: SupplyDemandAnalysis;
}

// ============================================
// ニュース・IR
// ============================================

export interface CompanyNews {
  id: string;
  date: string;
  title: string;
  source: string;
  category: 'earnings' | 'ir' | 'news' | 'analyst';
  url?: string;
}

// ============================================
// IR/開示情報
// ============================================

export interface DisclosureDocument {
  id: string;
  date: string;           // 提出日
  fiscalYear: string;     // 決算期
  type: 'yuho' | 'tanshin' | 'rinji' | 'naibu' | 'tob' | 'shiryou';
  title: string;
  pdfUrl?: string;
  pages?: number;
}

export interface FilingScheduleRow {
  fiscalYear: string;
  fiscalEnd: string;        // 決算期末日
  tanshinDate: string;      // 短信発表日
  yuhoDate: string;         // 有報提出日
  daysToYuho: number;       // 決算日→有報提出の日数
  tanshinToYuho: number;    // 短信→有報の日数
}

export interface TanshinEarnings {
  fiscalYear: string;
  period: string;           // 通期/1Q/2Q/3Q
  revenue: number;          // 売上高（百万円）
  operatingIncome: number;
  ordinaryIncome: number;
  netIncome: number;
  eps: number;
  dividendForecast: number; // 配当予想
  dividendActual?: number;  // 配当実績
  payoutRatio?: number;     // 配当性向
}

export interface EarningsRevision {
  date: string;             // 発表日
  fiscalYear: string;
  item: string;             // 修正項目
  beforeValue: number;
  afterValue: number;
  changeRate: number;       // 修正率（%）
  reason: string;
}

export interface YuhoDetailItem {
  category: string;         // カテゴリ（従業員, 設備投資, 研究開発, etc.）
  label: string;
  values: { fiscalYear: string; value: number | string }[];
  unit?: string;
}

export interface AccountItem {
  code: string;
  name: string;
  category: 'bs' | 'pl' | 'cf';  // BS/PL/CF
  subcategory: string;            // 流動資産, 固定資産, etc.
  values: { fiscalYear: string; amount: number }[];
  unit: string;
}

export interface IFRSSummaryRow {
  label: string;
  values: { fiscalYear: string; amount: number }[];
  indent?: number;          // インデント（小項目表示用）
  isBold?: boolean;         // 合計行
}

// 有報の各セクション（事業概要・リスク・経理 等）
export interface YuhoSection {
  sectionId: string;
  category: string;         // "事業の状況", "経理の状況", etc.
  title: string;
  excerpt?: string;         // プレビューテキスト
  fiscalYear: string;
}

// 有報の注記ブロック（テキスト本文）
export interface YuhoNoteBlock {
  blockId: string;
  title: string;
  content: string;          // テキスト本文（モック）
  fiscalYear: string;
}

export interface IrDisclosureData {
  documents: DisclosureDocument[];
  filingSchedule: FilingScheduleRow[];
  tanshinEarnings: TanshinEarnings[];
  earningsRevisions: EarningsRevision[];
  yuhoDetails: YuhoDetailItem[];
  accountItems: AccountItem[];
  ifrsSummary: IFRSSummaryRow[];
  yuhoSections: YuhoSection[];
  yuhoNoteBlocks: YuhoNoteBlock[];
}

export interface ValuationHistory {
  fiscalYear: string;
  stockPrice: number;        // 株価（円）
  marketCap: number;         // 時価総額（億円）
  per: number;               // PER（倍）
  pbr: number;               // PBR（倍）
  roe: number;               // ROE（%）
  dividendYield: number;     // 配当利回り（%）
}

export interface CompanyFinancials {
  summary: CompanySummary;
  profile: CompanyProfile;
  annualResults: AnnualResult[];
  quarterlyResults: QuarterlyResult[];
  balanceSheets: BalanceSheet[];
  cashFlows: CashFlow[];
  dividends: DividendData[];
  stockPriceHistory: StockPricePoint[];
  segments: BusinessSegment[];
  shareholders: Shareholder[];
  forecast: EarningsForecast;
  commentary: ShikihoCommentary;
  metricsDashboard: MetricsDashboard;
  perShareMetrics: PerShareMetrics[];
  companyInfo: CompanyInfoData;
  marginData: MarginData;
  news: CompanyNews[];
  irDisclosure: IrDisclosureData;
  valuationHistory: ValuationHistory[];
}

export type FinancialTabType = 'results' | 'quarterly' | 'balance' | 'cashflow' | 'dividend' | 'metrics' | 'cost_analysis' | 'per_band';

// ============================================
// 企業情報 - 役員
// ============================================

export interface DirectorShareHistory {
  year: string;            // "2020年" 形式
  shares: number;          // 保有株式数
  sharesValue: number;     // 評価額（万円）
}

export interface DirectorHolding {
  stockCode: string;
  stockName: string;
  shares: number;
  value: number;           // 万円
}

export interface Director {
  name: string;
  position: string;
  age: number;
  tenure: string;          // "3年" 形式
  isOutside: boolean;      // 社外取締役
  shares: number;          // 保有株式数
  sharesValue: number;     // 評価額（万円）
  career: string;          // 経歴
  shareHistory: DirectorShareHistory[];  // 保有株推移
  otherHoldings: DirectorHolding[];      // 他社保有株
}

// ============================================
// 企業情報 - 役員報酬
// ============================================

export interface DirectorCompensation {
  fiscalYear: string;
  category: string;                // "取締役" | "監査役" | "社外役員"
  headcount: number;
  fixedComp: number;              // 固定報酬（百万円）
  performanceComp: number;        // 業績連動報酬
  stockComp: number;              // 株式報酬
  totalComp: number;              // 合計
}

// ============================================
// 企業情報 - 1億以上の役員
// ============================================

export interface HighPaidDirector {
  name: string;
  position: string;
  fixedComp: number;
  performanceComp: number;
  stockComp: number;
  totalComp: number;              // 百万円
}

// ============================================
// 企業情報 - 監査報酬
// ============================================

export interface AuditFee {
  fiscalYear: string;
  auditFee: number;               // 監査報酬（百万円）
  nonAuditFee: number;            // 非監査報酬
  totalFee: number;
}

// ============================================
// 企業情報 - 社員の状況
// ============================================

export interface EmployeeSegment {
  segmentName: string;
  employeeCount: number;
  averageAge: number;
  averageTenure: number;          // 平均勤続年数
  averageSalary: number;          // 平均年収（万円）
}

// ============================================
// 企業情報 - 従業員の推移
// ============================================

export interface EmployeeTrend {
  fiscalYear: string;
  employeeCount: number;
  tempCount: number;              // 臨時従業員数
}

// ============================================
// 企業情報 - 平均年収の推移
// ============================================

export interface SalaryTrend {
  fiscalYear: string;
  averageSalary: number;          // 万円
  averageAge: number;
  averageTenure: number;
}

// ============================================
// 企業情報 - 借入金等の返済予定
// ============================================

export interface DebtRepaymentSchedule {
  category: string;               // "短期借入金" | "長期借入金" | "社債" | "リース債務"
  within1Year: number;            // 百万円
  within2Years: number;
  within3Years: number;
  within4Years: number;
  within5Years: number;
  over5Years: number;
  total: number;
}

// ============================================
// 企業情報 - 主な資産及び負債の内訳
// ============================================

export interface AssetLiabilityItem {
  category: 'asset' | 'liability';
  label: string;
  amount: number;                 // 百万円
  percentage: number;             // 総資産比率（%）
}

// ============================================
// 企業情報 - 関係会社・投資先
// ============================================

export interface Subsidiary {
  name: string;
  location: string;
  capitalAmount: number;          // 資本金（百万円）
  ownershipPct: number;           // 議決権比率（%）
  business: string;               // 事業内容
  isConsolidated: boolean;        // 連結対象
  relationship: 'subsidiary' | 'affiliate' | 'investment';
}

// ============================================
// 企業情報 - 配当/株主還元
// ============================================

export interface ShareholderReturn {
  fiscalYear: string;
  dividendPerShare: number;       // 1株配当（円）
  payoutRatio: number;            // 配当性向（%）
  buybackAmount: number;          // 自社株買い（百万円）
  totalReturnRatio: number;       // 総還元性向（%）
  totalReturnAmount: number;      // 総還元額（百万円）
}

// ============================================
// 企業情報 - 株式発行情報
// ============================================

export interface ShareIssuance {
  authorizedShares: number;       // 発行可能株式総数
  issuedShares: number;           // 発行済株式総数
  treasuryShares: number;         // 自己株式数
  outstandingShares: number;      // 流通株式数
  unitShares: number;             // 単元株式数（通常100）
  listingDate: string;
}

// ============================================
// 企業情報 - 大量保有報告
// ============================================

export interface LargeHolding {
  holderName: string;
  reportDate: string;             // 報告日
  sharesHeld: number;             // 保有株数（千株）
  holdingRatio: number;           // 保有割合（%）
  purpose: string;                // 保有目的
  changeType: 'increase' | 'decrease' | 'new' | 'disposal';
}

// ============================================
// 企業情報 - 大量保有（被保有）
// ============================================

export interface LargeHoldingTarget {
  targetName: string;             // 保有先企業名
  targetCode?: string;            // 銘柄コード
  sharesHeld: number;             // 保有株数（千株）
  holdingRatio: number;           // 保有割合（%）
  bookValue: number;              // 帳簿価額（百万円）
}

// ============================================
// 企業情報 - 自社株買い実績
// ============================================

export interface ShareBuyback {
  period: string;                 // "2024/3" 形式
  sharesAcquired: number;        // 取得株数（千株）
  acquisitionAmount: number;     // 取得金額（百万円）
  sharesRetired: number;         // 消却株数（千株）
  method: string;                // 取得方法
}

// ============================================
// 企業情報 - 株券貸付関連
// ============================================

export interface StockLending {
  lender: string;                 // 貸出先
  sharesLent: number;             // 貸出株数（千株）
  lendingFee: number;             // 貸出料率（%）
  startDate: string;
  endDate: string;
}

// ============================================
// 企業情報 - 主要な顧客
// ============================================

export interface MajorCustomer {
  name: string;
  salesAmount: number;            // 売上高（百万円）
  salesRatio: number;             // 売上構成比（%）
  segment?: string;               // 関連セグメント
}

// ============================================
// 企業情報 - 取引先
// ============================================

export interface BusinessPartner {
  name: string;
  type: 'supplier' | 'sales' | 'other';  // 仕入先/販売先/その他
  transactionAmount: number;      // 取引金額（百万円）
  description: string;
}

// ============================================
// 企業情報 - 株主優待
// ============================================

export interface ShareholderBenefit {
  rightsMonth: string;            // 権利確定月 "3月,9月"
  minimumShares: number;          // 必要最低株数
  benefitDescription: string;     // 優待内容
  estimatedValue: number;         // 概算金額（円）
  yieldOnMinimum: number;         // 優待利回り（%）
  notes?: string;
}

// ============================================
// 企業情報 - 沿革
// ============================================

export interface CompanyHistoryEvent {
  year: string;
  event: string;
}

// ============================================
// 企業情報 - 統合型
// ============================================

export interface CompanyInfoData {
  directors: Director[];
  directorCompensation: DirectorCompensation[];
  highPaidDirectors: HighPaidDirector[];
  auditFees: AuditFee[];
  employeeSegments: EmployeeSegment[];
  employeeTrends: EmployeeTrend[];
  salaryTrends: SalaryTrend[];
  debtRepayment: DebtRepaymentSchedule[];
  assetLiabilityBreakdown: AssetLiabilityItem[];
  subsidiaries: Subsidiary[];
  shareholderReturns: ShareholderReturn[];
  shareIssuance: ShareIssuance;
  largeHoldings: LargeHolding[];
  largeHoldingTargets: LargeHoldingTarget[];
  shareBuybacks: ShareBuyback[];
  stockLendings: StockLending[];
  majorCustomers: MajorCustomer[];
  businessPartners: BusinessPartner[];
  shareholderBenefits: ShareholderBenefit[];
  history: CompanyHistoryEvent[];
}

// ============================================
// 有価証券報告書 詳細データ（決算年度別）
// ============================================

/** 損益計算書 明細行 */
export interface PLLineItem {
  label: string;
  value: number;           // 百万円
  prevValue?: number;      // 前期値（百万円）
  indent?: number;         // ネスト深度（0=見出し, 1=小計, 2=明細）
  isBold?: boolean;        // 太字表示（合計行）
}

/** 貸借対照表 明細行 */
export interface BSLineItem {
  label: string;
  value: number;
  prevValue?: number;
  indent?: number;
  isBold?: boolean;
}

/** キャッシュフロー計算書 明細行 */
export interface CFLineItem {
  label: string;
  value: number;
  prevValue?: number;
  indent?: number;
  isBold?: boolean;
}

/** 決算年度の詳細財務諸表 */
export interface FiscalYearDetail {
  stockCode: string;
  stockName: string;
  fiscalYear: string;              // "2024/3"
  fiscalPeriod: string;            // "2023/4-2024/3"
  prevFiscalPeriod?: string;       // "2022/4-2023/3"
  reportType: '有価証券報告書' | '四半期報告書';
  filingDate: string;              // "2024-06-21"
  yuhoUrl: string;                 // EDINET等へのリンク
  plItems: PLLineItem[];
  bsItems: BSLineItem[];
  cfItems: CFLineItem[];
}
