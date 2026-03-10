/**
 * 企業財務データをBlockNote互換のブロック配列に変換するユーティリティ
 *
 * BlockNote PartialBlock 最小形式（テストで使われている形式と同一）:
 *   { type: "paragraph", content: [{ type:"text", text:"...", styles:{} }] }
 *
 * id / props / children はBlockNoteが自動補完するため省略可能
 */
import {
  CompanySummary,
  CompanyProfile,
  AnnualResult,
  QuarterlyResult,
  BalanceSheet,
  CashFlow,
  DividendData,
  StockPricePoint,
  EarningsForecast,
  ShikihoCommentary,
  MetricsDashboard,
  BusinessSegment,
  Shareholder,
} from '../../features/company/types/financials.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BNBlock = any;

function text(s: string) {
  return { type: 'text', text: s, styles: {} };
}

function paragraph(s: string): BNBlock {
  if (!s) return { type: 'paragraph' };
  return { type: 'paragraph', content: [text(s)] };
}

function heading(s: string, level: number = 2): BNBlock {
  return { type: 'heading', props: { level }, content: [text(s)] };
}

function bullet(s: string): BNBlock {
  return { type: 'bulletListItem', content: [text(s)] };
}

function fmtCurrency(v: number): string {
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}兆円`;
  if (Math.abs(v) >= 10000) return `${Math.round(v / 100).toLocaleString()}億円`;
  return `${v.toLocaleString()}百万円`;
}

function fmtYoY(v?: number): string {
  if (v == null) return '—';
  return v > 0 ? `+${v}%` : `${v}%`;
}

// ============================================
// サマリー（指標）
// ============================================

export function summaryToBlocks(s: CompanySummary): BNBlock[] {
  const fmtCap = s.marketCap >= 10000
    ? `${(s.marketCap / 10000).toFixed(1)}兆円`
    : `${s.marketCap.toLocaleString()}億円`;

  return [
    heading(`${s.stockName}（${s.stockCode}）企業概要`, 2),
    bullet(`株価: ${s.currentPrice.toLocaleString()}円`),
    bullet(`時価総額: ${fmtCap}`),
    bullet(`PER: ${s.per}倍 / PBR: ${s.pbr}倍`),
    bullet(`ROE: ${s.roe}% / ROA: ${s.roa}%`),
    bullet(`配当利回り: ${s.dividendYield}%`),
    bullet(`市場: ${s.market} / セクター: ${s.sector}`),
    paragraph(''),
  ];
}

// ============================================
// 業績
// ============================================

export function annualResultsToBlocks(data: AnnualResult[], companyName: string): BNBlock[] {
  return [
    heading(`${companyName} 業績推移`, 2),
    ...data.map((r) =>
      bullet(
        `${r.fiscalYear}: 売上 ${fmtCurrency(r.revenue)}（${fmtYoY(r.revenueYoY)}）/ 営業利益 ${fmtCurrency(r.operatingIncome)}（${fmtYoY(r.operatingIncomeYoY)}）/ 純利益 ${fmtCurrency(r.netIncome)} / 営業利益率 ${r.operatingMargin}% / ROE ${r.roe}%`
      )
    ),
    paragraph(''),
  ];
}

// ============================================
// 四半期
// ============================================

export function quarterlyResultsToBlocks(data: QuarterlyResult[], companyName: string): BNBlock[] {
  return [
    heading(`${companyName} 四半期業績`, 2),
    ...data.map((r) =>
      bullet(
        `${r.period}: 売上 ${fmtCurrency(r.revenue)}（${fmtYoY(r.revenueYoY)}）/ 営業利益 ${fmtCurrency(r.operatingIncome)}（${fmtYoY(r.operatingIncomeYoY)}）`
      )
    ),
    paragraph(''),
  ];
}

// ============================================
// 財務（BS）
// ============================================

export function balanceSheetsToBlocks(data: BalanceSheet[], companyName: string): BNBlock[] {
  return [
    heading(`${companyName} 財務状況`, 2),
    ...data.map((r) =>
      bullet(
        `${r.fiscalYear}: 総資産 ${fmtCurrency(r.totalAssets)} / 純資産 ${fmtCurrency(r.netAssets)} / 自己資本比率 ${r.equityRatio}% / 有利子負債 ${fmtCurrency(r.interestBearingDebt)} / BPS ${r.bps.toLocaleString()}円`
      )
    ),
    paragraph(''),
  ];
}

// ============================================
// CF
// ============================================

export function cashFlowsToBlocks(data: CashFlow[], companyName: string): BNBlock[] {
  return [
    heading(`${companyName} キャッシュフロー`, 2),
    ...data.map((r) =>
      bullet(
        `${r.fiscalYear}: 営業CF ${fmtCurrency(r.operatingCF)} / 投資CF ${fmtCurrency(r.investingCF)} / 財務CF ${fmtCurrency(r.financingCF)} / フリーCF ${fmtCurrency(r.freeCF)}`
      )
    ),
    paragraph(''),
  ];
}

// ============================================
// 配当
// ============================================

export function dividendsToBlocks(data: DividendData[], companyName: string): BNBlock[] {
  return [
    heading(`${companyName} 配当推移`, 2),
    ...data.map((r) =>
      bullet(
        `${r.fiscalYear}: 一株配当 ${r.dividendPerShare}円 / 配当性向 ${r.payoutRatio}% / 利回り ${r.dividendYield}%`
      )
    ),
    paragraph(''),
  ];
}

// ============================================
// チャートサマリー（業績）
// ============================================

export function chartSummaryToBlocks(
  data: AnnualResult[],
  companyName: string
): BNBlock[] {
  if (data.length < 2) return [heading(`${companyName} 業績トレンド分析`, 3)];

  const first = data[0];
  const last = data[data.length - 1];
  const revGrowth = ((last.revenue - first.revenue) / first.revenue * 100).toFixed(1);
  const oiGrowth = ((last.operatingIncome - first.operatingIncome) / first.operatingIncome * 100).toFixed(1);

  return [
    heading(`${companyName} 業績トレンド分析`, 3),
    paragraph(`${first.fiscalYear}→${last.fiscalYear}の${data.length}年間推移`),
    bullet(`売上高: ${fmtCurrency(first.revenue)} → ${fmtCurrency(last.revenue)}（${revGrowth}%成長）`),
    bullet(`営業利益: ${fmtCurrency(first.operatingIncome)} → ${fmtCurrency(last.operatingIncome)}（${oiGrowth}%成長）`),
    bullet(`営業利益率: ${first.operatingMargin}% → ${last.operatingMargin}%`),
    bullet(`ROE: ${first.roe}% → ${last.roe}%`),
    paragraph(''),
  ];
}

// ============================================
// チャートサマリー（四半期）
// ============================================

export function quarterlyChartSummaryToBlocks(
  data: QuarterlyResult[],
  companyName: string
): BNBlock[] {
  if (data.length < 2) return [heading(`${companyName} 四半期トレンド`, 3)];

  const first = data[0];
  const last = data[data.length - 1];

  return [
    heading(`${companyName} 四半期トレンド`, 3),
    paragraph(`${first.period}→${last.period}の推移`),
    bullet(`売上高: ${fmtCurrency(first.revenue)} → ${fmtCurrency(last.revenue)}`),
    bullet(`営業利益: ${fmtCurrency(first.operatingIncome)} → ${fmtCurrency(last.operatingIncome)}`),
    paragraph(''),
  ];
}

// ============================================
// チャートサマリー（財務）
// ============================================

export function balanceChartSummaryToBlocks(
  data: BalanceSheet[],
  companyName: string
): BNBlock[] {
  if (data.length < 2) return [heading(`${companyName} 財務トレンド`, 3)];

  const first = data[0];
  const last = data[data.length - 1];

  return [
    heading(`${companyName} 財務トレンド`, 3),
    paragraph(`${first.fiscalYear}→${last.fiscalYear}の推移`),
    bullet(`総資産: ${fmtCurrency(first.totalAssets)} → ${fmtCurrency(last.totalAssets)}`),
    bullet(`純資産: ${fmtCurrency(first.netAssets)} → ${fmtCurrency(last.netAssets)}`),
    bullet(`自己資本比率: ${first.equityRatio}% → ${last.equityRatio}%`),
    paragraph(''),
  ];
}

// ============================================
// チャートサマリー（CF）
// ============================================

export function cashFlowChartSummaryToBlocks(
  data: CashFlow[],
  companyName: string
): BNBlock[] {
  if (data.length < 2) return [heading(`${companyName} CFトレンド`, 3)];

  const first = data[0];
  const last = data[data.length - 1];

  return [
    heading(`${companyName} CFトレンド`, 3),
    paragraph(`${first.fiscalYear}→${last.fiscalYear}の推移`),
    bullet(`営業CF: ${fmtCurrency(first.operatingCF)} → ${fmtCurrency(last.operatingCF)}`),
    bullet(`フリーCF: ${fmtCurrency(first.freeCF)} → ${fmtCurrency(last.freeCF)}`),
    paragraph(''),
  ];
}

// ============================================
// チャートサマリー（配当）
// ============================================

export function dividendChartSummaryToBlocks(
  data: DividendData[],
  companyName: string
): BNBlock[] {
  if (data.length < 2) return [heading(`${companyName} 配当トレンド`, 3)];

  const first = data[0];
  const last = data[data.length - 1];

  return [
    heading(`${companyName} 配当トレンド`, 3),
    paragraph(`${first.fiscalYear}→${last.fiscalYear}の推移`),
    bullet(`一株配当: ${first.dividendPerShare}円 → ${last.dividendPerShare}円`),
    bullet(`配当性向: ${first.payoutRatio}% → ${last.payoutRatio}%`),
    bullet(`配当利回り: ${first.dividendYield}% → ${last.dividendYield}%`),
    paragraph(''),
  ];
}

// ============================================
// 企業概要（プロフィール）
// ============================================

export function profileToBlocks(p: CompanyProfile): BNBlock[] {
  return [
    heading('企業概要', 2),
    paragraph(p.description),
    bullet(`設立: ${p.founded}`),
    bullet(`従業員数: ${p.employees.toLocaleString()}人`),
    bullet(`平均年収: ${p.averageSalary.toLocaleString()}万円 / 平均年齢: ${p.averageAge}歳`),
    bullet(`本社: ${p.headquarters}`),
    bullet(`代表: ${p.ceo}`),
    bullet(`決算月: ${p.fiscalYearEnd}`),
    paragraph(''),
  ];
}

// ============================================
// 株価サマリー
// ============================================

export function stockPriceSummaryToBlocks(
  priceHistory: StockPricePoint[],
  currentPrice: number,
  companyName: string,
): BNBlock[] {
  if (priceHistory.length === 0) return [];
  const highs = priceHistory.map((p) => p.high);
  const lows = priceHistory.map((p) => p.low);
  const high52w = Math.max(...highs);
  const low52w = Math.min(...lows);
  const firstClose = priceHistory[0].close;
  const yearChange = ((currentPrice - firstClose) / firstClose * 100).toFixed(1);

  return [
    heading(`${companyName} 株価サマリー`, 2),
    bullet(`現在値: ${currentPrice.toLocaleString()}円`),
    bullet(`52週高値: ${high52w.toLocaleString()}円`),
    bullet(`52週安値: ${low52w.toLocaleString()}円`),
    bullet(`年間騰落率: ${Number(yearChange) > 0 ? '+' : ''}${yearChange}%`),
    paragraph(''),
  ];
}

// ============================================
// 業績予想・四季報コメント
// ============================================

export function forecastToBlocks(
  forecast: EarningsForecast,
  commentary: ShikihoCommentary,
  companyName: string,
): BNBlock[] {
  return [
    heading(`${companyName} 業績予想（${forecast.fiscalYear}期）`, 2),
    paragraph(`${commentary.headline}`),
    paragraph(commentary.body),
    bullet(`売上高予想: ${fmtCurrency(forecast.revenueEstimate)}（${fmtYoY(forecast.revenueYoY)}）`),
    bullet(`営業利益予想: ${fmtCurrency(forecast.operatingIncomeEstimate)}（${fmtYoY(forecast.operatingIncomeYoY)}）`),
    bullet(`純利益予想: ${fmtCurrency(forecast.netIncomeEstimate)}（${fmtYoY(forecast.netIncomeYoY)}）`),
    bullet(`EPS予想: ${forecast.epsEstimate.toFixed(1)}円 / 配当予想: ${forecast.dividendEstimate.toFixed(1)}円`),
    paragraph(''),
  ];
}

// ============================================
// 指標ダッシュボード
// ============================================

export function metricsDashboardToBlocks(d: MetricsDashboard, companyName: string): BNBlock[] {
  return [
    heading(`${companyName} 指標ダッシュボード`, 2),
    heading('収益性', 3),
    bullet(`営業利益率: ${d.profitability.operatingMargin}% / 純利益率: ${d.profitability.netMargin}%`),
    bullet(`ROE: ${d.profitability.roe}% / ROA: ${d.profitability.roa}% / ROIC: ${d.profitability.roic}%`),
    heading('成長性', 3),
    bullet(`売上成長率(3Y): ${d.growth.revenueGrowth3Y}% / 営業利益成長率(3Y): ${d.growth.operatingIncomeGrowth3Y}%`),
    bullet(`EPS成長率(3Y): ${d.growth.epsGrowth3Y}% / 売上CAGR(5Y): ${d.growth.revenueCAGR5Y}%`),
    heading('安全性', 3),
    bullet(`自己資本比率: ${d.stability.equityRatio}% / 流動比率: ${d.stability.currentRatio}%`),
    bullet(`D/Eレシオ: ${d.stability.debtToEquityRatio} / ネットD/E: ${d.stability.netDebtToEquityRatio}`),
    heading('割安性', 3),
    bullet(`PER: ${d.valuation.per}倍 / PBR: ${d.valuation.pbr}倍 / EV/EBITDA: ${d.valuation.evToEbitda}倍`),
    bullet(`PCFR: ${d.valuation.pcfr}倍 / 配当利回り: ${d.valuation.dividendYield}%`),
    paragraph(''),
  ];
}

// ============================================
// セグメント構成
// ============================================

export function segmentsToBlocks(segments: BusinessSegment[], companyName: string): BNBlock[] {
  return [
    heading(`${companyName} セグメント構成`, 2),
    ...segments.map((s) =>
      bullet(`${s.name}: 売上 ${fmtCurrency(s.revenue)}（構成比 ${s.percentage}%）/ 営業利益 ${fmtCurrency(s.operatingIncome)}`)
    ),
    paragraph(''),
  ];
}

// ============================================
// 大株主
// ============================================

export function shareholdersToBlocks(shareholders: Shareholder[], companyName: string): BNBlock[] {
  return [
    heading(`${companyName} 大株主`, 2),
    ...shareholders.map((s, i) =>
      bullet(`${i + 1}. ${s.name}: ${s.percentage.toFixed(1)}%（${s.shares.toLocaleString()}千株）`)
    ),
    paragraph(''),
  ];
}
