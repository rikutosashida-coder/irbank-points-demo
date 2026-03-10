// ============================================
// バックテスト型定義
// ============================================

/** 使用可能な財務指標 */
export type MetricKey =
  | 'roe'
  | 'roa'
  | 'per'
  | 'pbr'
  | 'operatingMargin'
  | 'revenueYoY'
  | 'equityRatio'
  | 'dividendYield';

export interface MetricMeta {
  key: MetricKey;
  label: string;
  unit: string;
  defaultOperator: '>' | '<';
  defaultValue: number;
}

/** 利用可能な指標の定義 */
export const METRIC_OPTIONS: MetricMeta[] = [
  { key: 'roe', label: 'ROE', unit: '%', defaultOperator: '>', defaultValue: 10 },
  { key: 'roa', label: 'ROA', unit: '%', defaultOperator: '>', defaultValue: 5 },
  { key: 'per', label: 'PER', unit: '倍', defaultOperator: '<', defaultValue: 20 },
  { key: 'pbr', label: 'PBR', unit: '倍', defaultOperator: '<', defaultValue: 1.5 },
  { key: 'operatingMargin', label: '営業利益率', unit: '%', defaultOperator: '>', defaultValue: 8 },
  { key: 'revenueYoY', label: '売上高前年比', unit: '%', defaultOperator: '>', defaultValue: 5 },
  { key: 'equityRatio', label: '自己資本比率', unit: '%', defaultOperator: '>', defaultValue: 40 },
  { key: 'dividendYield', label: '配当利回り', unit: '%', defaultOperator: '>', defaultValue: 2 },
];

/** バックテスト条件（1ルール） */
export interface BacktestCondition {
  id: string;
  metric: MetricKey;
  operator: '>' | '<' | '>=' | '<=';
  value: number;
  enabled: boolean;
}

/** バックテスト戦略 */
export interface BacktestStrategy {
  conditions: BacktestCondition[];
  holdingPeriodDays: number;
  stopLossPct: number;
  takeProfitPct: number;
}

/** 個別トレード結果 */
export interface BacktestTrade {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  returnPct: number;
  holdingDays: number;
  exitReason: 'take_profit' | 'stop_loss' | 'holding_period' | 'signal_exit';
}

/** 条件の評価結果 */
export interface ConditionResult {
  metric: MetricKey;
  label: string;
  met: boolean;
  currentValue: number;
  threshold: number;
  operator: string;
}

/** バックテスト全体結果 */
export interface BacktestResult {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgHoldingDays: number;
  trades: BacktestTrade[];
  equityCurve: { date: string; value: number }[];
  signalStrength: number;
  conditionResults: ConditionResult[];
}

/** デフォルト戦略 */
export function createDefaultStrategy(): BacktestStrategy {
  return {
    conditions: [],
    holdingPeriodDays: 30,
    stopLossPct: 5,
    takeProfitPct: 10,
  };
}

/** 退出理由の日本語ラベル */
export const EXIT_REASON_LABELS: Record<BacktestTrade['exitReason'], string> = {
  take_profit: '利確',
  stop_loss: '損切',
  holding_period: '保有期限',
  signal_exit: 'シグナル終了',
};
