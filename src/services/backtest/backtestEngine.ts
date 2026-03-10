/**
 * バックテストエンジン（モック実装）
 *
 * 財務条件でシグナル強度を算出し、株価データ上でトレードをシミュレーションする。
 * 実際のプロダクションでは外部API or WebWorkerで実行する想定。
 */

import { getCompanyFinancials } from '../api/companyFinancialsApi';
import type { CompanyFinancials, StockPricePoint } from '../../features/company/types/financials.types';
import type {
  BacktestStrategy,
  BacktestResult,
  BacktestTrade,
  ConditionResult,
  MetricKey,
} from '../../features/backtest/types/backtest.types';
import { METRIC_OPTIONS } from '../../features/backtest/types/backtest.types';

// ============================================
// 指標値の取得
// ============================================

function getMetricValue(metric: MetricKey, financials: CompanyFinancials): number {
  const s = financials.summary;
  const ar = financials.annualResults;
  const bs = financials.balanceSheets;
  const latest = ar[ar.length - 1];
  const latestBS = bs[bs.length - 1];

  switch (metric) {
    case 'roe': return latest?.roe ?? 0;
    case 'roa': return latest?.roa ?? 0;
    case 'per': return s.per;
    case 'pbr': return s.pbr;
    case 'operatingMargin': return latest?.operatingMargin ?? 0;
    case 'revenueYoY': return latest?.revenueYoY ?? 0;
    case 'equityRatio': return latestBS?.equityRatio ?? 0;
    case 'dividendYield': return s.dividendYield;
    default: return 0;
  }
}

function evaluateCondition(value: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case '>': return value > threshold;
    case '<': return value < threshold;
    case '>=': return value >= threshold;
    case '<=': return value <= threshold;
    default: return false;
  }
}

// ============================================
// SMA 計算
// ============================================

function calcSMA(prices: StockPricePoint[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < window - 1) {
      result.push(prices[i].close);
    } else {
      let sum = 0;
      for (let j = i - window + 1; j <= i; j++) {
        sum += prices[j].close;
      }
      result.push(sum / window);
    }
  }
  return result;
}

// ============================================
// メインエンジン
// ============================================

export async function runBacktest(
  stockCode: string,
  strategy: BacktestStrategy,
): Promise<BacktestResult> {
  // データ取得
  const financials = await getCompanyFinancials(stockCode);
  if (!financials) {
    throw new Error(`銘柄 ${stockCode} のデータが見つかりません`);
  }

  // 疑似遅延（バックテスト計算をシミュレート）
  await new Promise(r => setTimeout(r, 300 + Math.random() * 500));

  const prices = financials.stockPriceHistory;
  if (prices.length < 30) {
    throw new Error('株価データが不足しています（最低30日分必要）');
  }

  // 1. 条件評価
  const enabledConditions = strategy.conditions.filter(c => c.enabled);
  const conditionResults: ConditionResult[] = enabledConditions.map(c => {
    const currentValue = getMetricValue(c.metric, financials);
    const met = evaluateCondition(currentValue, c.operator, c.value);
    const meta = METRIC_OPTIONS.find(m => m.key === c.metric);
    return {
      metric: c.metric,
      label: meta?.label ?? c.metric,
      met,
      currentValue: Math.round(currentValue * 100) / 100,
      threshold: c.value,
      operator: c.operator,
    };
  });

  const signalStrength = enabledConditions.length > 0
    ? conditionResults.filter(r => r.met).length / enabledConditions.length
    : 0;

  // 2. トレードシミュレーション
  const trades = simulateTrades(prices, strategy, signalStrength);

  // 3. エクイティカーブ生成
  const equityCurve = buildEquityCurve(prices, trades);

  // 4. 指標計算
  const metrics = calculateMetrics(trades, equityCurve, prices.length, strategy.holdingPeriodDays);

  return {
    ...metrics,
    trades,
    equityCurve,
    signalStrength,
    conditionResults,
  };
}

// ============================================
// トレードシミュレーション
// ============================================

function simulateTrades(
  prices: StockPricePoint[],
  strategy: BacktestStrategy,
  signalStrength: number,
): BacktestTrade[] {
  // シグナルが弱い場合はトレードなし
  if (signalStrength < 0.3) return [];

  const trades: BacktestTrade[] = [];
  const sma = calcSMA(prices, 20);
  const smaShort = calcSMA(prices, 5);

  let inPosition = false;
  let entryIdx = 0;
  let entryPrice = 0;

  for (let i = 20; i < prices.length; i++) {
    if (!inPosition) {
      // エントリー条件: 短期SMAが長期SMAを下回る（押し目買い）
      // シグナル強度が高いほどエントリー基準が緩い
      const threshold = 1 - signalStrength * 0.02;
      if (smaShort[i] < sma[i] * threshold && prices[i].close < sma[i]) {
        inPosition = true;
        entryIdx = i;
        entryPrice = prices[i].close;
      }
    } else {
      const daysSince = i - entryIdx;
      const currentReturn = ((prices[i].close - entryPrice) / entryPrice) * 100;

      let exitReason: BacktestTrade['exitReason'] | null = null;

      if (currentReturn >= strategy.takeProfitPct) {
        exitReason = 'take_profit';
      } else if (currentReturn <= -strategy.stopLossPct) {
        exitReason = 'stop_loss';
      } else if (daysSince >= strategy.holdingPeriodDays) {
        exitReason = 'holding_period';
      }

      if (exitReason) {
        trades.push({
          entryDate: prices[entryIdx].date,
          exitDate: prices[i].date,
          entryPrice: Math.round(entryPrice),
          exitPrice: Math.round(prices[i].close),
          returnPct: Math.round(currentReturn * 100) / 100,
          holdingDays: daysSince,
          exitReason,
        });
        inPosition = false;
      }
    }
  }

  // 期末にまだポジションを持っている場合は決済
  if (inPosition) {
    const lastIdx = prices.length - 1;
    const currentReturn = ((prices[lastIdx].close - entryPrice) / entryPrice) * 100;
    trades.push({
      entryDate: prices[entryIdx].date,
      exitDate: prices[lastIdx].date,
      entryPrice: Math.round(entryPrice),
      exitPrice: Math.round(prices[lastIdx].close),
      returnPct: Math.round(currentReturn * 100) / 100,
      holdingDays: lastIdx - entryIdx,
      exitReason: 'signal_exit',
    });
  }

  return trades;
}

// ============================================
// エクイティカーブ生成
// ============================================

function buildEquityCurve(
  prices: StockPricePoint[],
  trades: BacktestTrade[],
): { date: string; value: number }[] {
  const INITIAL = 1000000; // 100万円
  let equity = INITIAL;
  const curve: { date: string; value: number }[] = [];

  // トレードのタイムラインを構築
  const tradeMap = new Map<string, { type: 'entry' | 'exit'; trade: BacktestTrade }>();
  for (const t of trades) {
    tradeMap.set(t.entryDate + ':entry', { type: 'entry', trade: t });
    tradeMap.set(t.exitDate + ':exit', { type: 'exit', trade: t });
  }

  let inTrade: BacktestTrade | null = null;
  let tradeEntryEquity = INITIAL;

  for (const price of prices) {
    const entry = tradeMap.get(price.date + ':entry');
    const exit = tradeMap.get(price.date + ':exit');

    if (entry && !inTrade) {
      inTrade = entry.trade;
      tradeEntryEquity = equity;
    }

    if (inTrade) {
      // ポジション中: 日次の株価変動を反映
      const dayReturn = (price.close - inTrade.entryPrice) / inTrade.entryPrice;
      equity = tradeEntryEquity * (1 + dayReturn);
    }

    if (exit) {
      // トレード完了
      equity = tradeEntryEquity * (1 + exit.trade.returnPct / 100);
      inTrade = null;
    }

    curve.push({ date: price.date, value: Math.round(equity) });
  }

  return curve;
}

// ============================================
// 指標計算
// ============================================

function calculateMetrics(
  trades: BacktestTrade[],
  equityCurve: { date: string; value: number }[],
  totalDays: number,
  holdingPeriod: number,
): Omit<BacktestResult, 'trades' | 'equityCurve' | 'signalStrength' | 'conditionResults'> {
  if (trades.length === 0) {
    return {
      totalReturn: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
      avgHoldingDays: 0,
    };
  }

  // トータルリターン
  const compoundReturn = trades.reduce((acc, t) => acc * (1 + t.returnPct / 100), 1);
  const totalReturn = (compoundReturn - 1) * 100;

  // 年率換算
  const annualizedReturn = totalDays > 0
    ? (Math.pow(compoundReturn, 250 / totalDays) - 1) * 100
    : totalReturn;

  // 勝率
  const wins = trades.filter(t => t.returnPct > 0);
  const losses = trades.filter(t => t.returnPct <= 0);
  const winRate = (wins.length / trades.length) * 100;

  // プロフィットファクター
  const grossProfit = wins.reduce((s, t) => s + t.returnPct, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.returnPct, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;

  // 最大ドローダウン
  let peak = equityCurve[0]?.value ?? 0;
  let maxDD = 0;
  for (const point of equityCurve) {
    if (point.value > peak) peak = point.value;
    const dd = peak > 0 ? ((peak - point.value) / peak) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
  }

  // シャープレシオ（簡易版）
  const returns = trades.map(t => t.returnPct);
  const avgReturn = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / Math.max(returns.length - 1, 1);
  const stdDev = Math.sqrt(variance);
  const annualizationFactor = Math.sqrt(250 / Math.max(holdingPeriod, 1));
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * annualizationFactor : 0;

  // 平均保有日数
  const avgHoldingDays = trades.reduce((s, t) => s + t.holdingDays, 0) / trades.length;

  return {
    totalReturn: Math.round(totalReturn * 100) / 100,
    annualizedReturn: Math.round(annualizedReturn * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDD * 100) / 100,
    winRate: Math.round(winRate * 10) / 10,
    profitFactor: Math.round(profitFactor * 100) / 100,
    totalTrades: trades.length,
    avgHoldingDays: Math.round(avgHoldingDays),
  };
}
