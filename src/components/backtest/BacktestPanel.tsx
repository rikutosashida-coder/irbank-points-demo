import { useState, useCallback, useMemo } from 'react';
import { FiPlay, FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';
import {
  BacktestStrategy,
  BacktestCondition,
  BacktestResult,
  METRIC_OPTIONS,
  EXIT_REASON_LABELS,
  createDefaultStrategy,
} from '../../features/backtest/types/backtest.types';
import { runBacktest } from '../../services/backtest/backtestEngine';
import { EquityCurveChart } from './EquityCurveChart';

interface BacktestPanelProps {
  stockCode?: string;
}

// ============================================
// メインコンポーネント
// ============================================

export function BacktestPanel({ stockCode }: BacktestPanelProps) {
  const [strategy, setStrategy] = useState<BacktestStrategy>(createDefaultStrategy);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTrades, setShowTrades] = useState(false);

  // 条件追加
  const addCondition = useCallback(() => {
    const used = new Set(strategy.conditions.map(c => c.metric));
    const available = METRIC_OPTIONS.find(m => !used.has(m.key)) ?? METRIC_OPTIONS[0];
    const newCond: BacktestCondition = {
      id: crypto.randomUUID(),
      metric: available.key,
      operator: available.defaultOperator,
      value: available.defaultValue,
      enabled: true,
    };
    setStrategy(prev => ({ ...prev, conditions: [...prev.conditions, newCond] }));
  }, [strategy.conditions]);

  // 条件削除
  const removeCondition = useCallback((id: string) => {
    setStrategy(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id),
    }));
  }, []);

  // 条件更新
  const updateCondition = useCallback((id: string, updates: Partial<BacktestCondition>) => {
    setStrategy(prev => ({
      ...prev,
      conditions: prev.conditions.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  // 戦略パラメータ更新
  const updateStrategy = useCallback((updates: Partial<BacktestStrategy>) => {
    setStrategy(prev => ({ ...prev, ...updates }));
  }, []);

  // バックテスト実行
  const handleRun = useCallback(async () => {
    if (!stockCode) {
      setError('銘柄コードが指定されていません。銘柄タグを追加してください。');
      return;
    }
    if (strategy.conditions.filter(c => c.enabled).length === 0) {
      setError('少なくとも1つの条件を追加してください。');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await runBacktest(stockCode, strategy);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'バックテストに失敗しました');
    } finally {
      setIsRunning(false);
    }
  }, [stockCode, strategy]);

  if (!stockCode) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FiAlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          バックテストを実行するには銘柄コードが必要です
        </p>
        <p className="text-xs text-gray-500">
          アンカータグに銘柄を追加してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 仮説ビルダー */}
      <HypothesisBuilder
        strategy={strategy}
        onAddCondition={addCondition}
        onRemoveCondition={removeCondition}
        onUpdateCondition={updateCondition}
        onUpdateStrategy={updateStrategy}
      />

      {/* 実行ボタン */}
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isRunning ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            バックテスト実行中...
          </>
        ) : (
          <>
            <FiPlay className="w-4 h-4" />
            バックテスト実行
          </>
        )}
      </button>

      {/* エラー表示 */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* 結果表示 */}
      {result && (
        <>
          {/* 条件評価結果 */}
          <ConditionResultsCard result={result} />

          {/* スコアカード */}
          <Scorecard result={result} />

          {/* エクイティカーブ */}
          {result.equityCurve.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">エクイティカーブ</h4>
              <EquityCurveChart data={result.equityCurve} />
            </div>
          )}

          {/* トレード一覧 */}
          {result.trades.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setShowTrades(!showTrades)}
                className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>トレード一覧（{result.trades.length}件）</span>
                {showTrades ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {showTrades && <TradeList trades={result.trades} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// 仮説ビルダー
// ============================================

function HypothesisBuilder({
  strategy,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
  onUpdateStrategy,
}: {
  strategy: BacktestStrategy;
  onAddCondition: () => void;
  onRemoveCondition: (id: string) => void;
  onUpdateCondition: (id: string, updates: Partial<BacktestCondition>) => void;
  onUpdateStrategy: (updates: Partial<BacktestStrategy>) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">投資仮説（条件設定）</h4>

      {/* 条件リスト */}
      {strategy.conditions.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">
          「条件を追加」ボタンで財務指標の条件を設定してください
        </p>
      ) : (
        <div className="space-y-2">
          {strategy.conditions.map(cond => (
            <ConditionRow
              key={cond.id}
              condition={cond}
              onUpdate={(u) => onUpdateCondition(cond.id, u)}
              onRemove={() => onRemoveCondition(cond.id)}
            />
          ))}
        </div>
      )}

      <button
        onClick={onAddCondition}
        disabled={strategy.conditions.length >= METRIC_OPTIONS.length}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <FiPlus className="w-4 h-4" />
        条件を追加
      </button>

      {/* 戦略パラメータ */}
      <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">保有期間（日）</label>
          <input
            type="number"
            min={1}
            max={365}
            value={strategy.holdingPeriodDays}
            onChange={e => onUpdateStrategy({ holdingPeriodDays: parseInt(e.target.value) || 30 })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">利確（%）</label>
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={strategy.takeProfitPct}
            onChange={e => onUpdateStrategy({ takeProfitPct: parseFloat(e.target.value) || 10 })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">損切（%）</label>
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={strategy.stopLossPct}
            onChange={e => onUpdateStrategy({ stopLossPct: parseFloat(e.target.value) || 5 })}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// 条件行
// ============================================

function ConditionRow({
  condition,
  onUpdate,
  onRemove,
}: {
  condition: BacktestCondition;
  onUpdate: (updates: Partial<BacktestCondition>) => void;
  onRemove: () => void;
}) {
  const meta = METRIC_OPTIONS.find(m => m.key === condition.metric);

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
      {/* 有効/無効チェック */}
      <input
        type="checkbox"
        checked={condition.enabled}
        onChange={e => onUpdate({ enabled: e.target.checked })}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />

      {/* 指標選択 */}
      <select
        value={condition.metric}
        onChange={e => {
          const newMeta = METRIC_OPTIONS.find(m => m.key === e.target.value);
          onUpdate({
            metric: e.target.value as any,
            operator: newMeta?.defaultOperator ?? '>',
            value: newMeta?.defaultValue ?? 0,
          });
        }}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        {METRIC_OPTIONS.map(m => (
          <option key={m.key} value={m.key}>{m.label}</option>
        ))}
      </select>

      {/* 演算子 */}
      <select
        value={condition.operator}
        onChange={e => onUpdate({ operator: e.target.value as any })}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 w-16 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
        <option value=">=">&ge;</option>
        <option value="<=">&le;</option>
      </select>

      {/* 閾値 */}
      <input
        type="number"
        step="any"
        value={condition.value}
        onChange={e => onUpdate({ value: parseFloat(e.target.value) || 0 })}
        className="w-20 text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />

      {/* 単位表示 */}
      <span className="text-xs text-gray-500 w-6">{meta?.unit}</span>

      {/* 削除ボタン */}
      <button
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <FiTrash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ============================================
// 条件評価結果
// ============================================

function ConditionResultsCard({ result }: { result: BacktestResult }) {
  if (result.conditionResults.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">条件評価</h4>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
          シグナル強度: {Math.round(result.signalStrength * 100)}%
        </span>
      </div>
      <div className="space-y-1.5">
        {result.conditionResults.map(cr => (
          <div key={cr.metric} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{cr.label}</span>
            <span className="flex items-center gap-2">
              <span className="text-gray-500">
                {cr.currentValue}{cr.operator === '>' || cr.operator === '>=' ? ' ≥ ' : ' ≤ '}{cr.threshold}
              </span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                cr.met ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {cr.met ? '合格' : '不合格'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// スコアカード
// ============================================

function Scorecard({ result }: { result: BacktestResult }) {
  const metrics = useMemo(() => [
    {
      label: 'トータルリターン',
      value: `${result.totalReturn > 0 ? '+' : ''}${result.totalReturn}%`,
      color: result.totalReturn >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      label: '年率リターン',
      value: `${result.annualizedReturn > 0 ? '+' : ''}${result.annualizedReturn}%`,
      color: result.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      label: 'シャープレシオ',
      value: result.sharpeRatio.toFixed(2),
      color: result.sharpeRatio >= 1 ? 'text-green-600' : result.sharpeRatio >= 0 ? 'text-gray-700' : 'text-red-600',
    },
    {
      label: '最大ドローダウン',
      value: `-${result.maxDrawdown}%`,
      color: result.maxDrawdown <= 10 ? 'text-green-600' : result.maxDrawdown <= 20 ? 'text-yellow-600' : 'text-red-600',
    },
    {
      label: '勝率',
      value: `${result.winRate}%`,
      color: result.winRate >= 50 ? 'text-green-600' : 'text-red-600',
    },
    {
      label: 'プロフィットファクター',
      value: result.profitFactor.toFixed(2),
      color: result.profitFactor >= 1.5 ? 'text-green-600' : result.profitFactor >= 1 ? 'text-gray-700' : 'text-red-600',
    },
    {
      label: '総トレード数',
      value: `${result.totalTrades}回`,
      color: 'text-gray-700',
    },
    {
      label: '平均保有日数',
      value: `${result.avgHoldingDays}日`,
      color: 'text-gray-700',
    },
  ], [result]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">バックテスト結果</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="text-center">
            <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// トレード一覧テーブル
// ============================================

function TradeList({ trades }: { trades: BacktestResult['trades'] }) {
  return (
    <div className="overflow-x-auto border-t border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left font-medium">#</th>
            <th className="px-4 py-2 text-left font-medium">エントリー</th>
            <th className="px-4 py-2 text-left font-medium">イグジット</th>
            <th className="px-4 py-2 text-right font-medium">買値</th>
            <th className="px-4 py-2 text-right font-medium">売値</th>
            <th className="px-4 py-2 text-right font-medium">リターン</th>
            <th className="px-4 py-2 text-right font-medium">保有日数</th>
            <th className="px-4 py-2 text-left font-medium">理由</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {trades.map((t, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-500">{i + 1}</td>
              <td className="px-4 py-2">{t.entryDate}</td>
              <td className="px-4 py-2">{t.exitDate}</td>
              <td className="px-4 py-2 text-right">¥{t.entryPrice.toLocaleString()}</td>
              <td className="px-4 py-2 text-right">¥{t.exitPrice.toLocaleString()}</td>
              <td className={`px-4 py-2 text-right font-medium ${
                t.returnPct >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {t.returnPct > 0 ? '+' : ''}{t.returnPct}%
              </td>
              <td className="px-4 py-2 text-right">{t.holdingDays}日</td>
              <td className="px-4 py-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  t.exitReason === 'take_profit' ? 'bg-green-100 text-green-700' :
                  t.exitReason === 'stop_loss' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {EXIT_REASON_LABELS[t.exitReason]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
