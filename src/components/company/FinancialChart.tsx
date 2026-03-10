import { forwardRef } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { FinancialTabType } from '../../features/company/types/financials.types';
import type { CompanyFinancials } from '../../features/company/types/financials.types';

interface FinancialChartProps {
  financials: CompanyFinancials;
  activeTab: FinancialTabType;
}

function formatYen(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}兆`;
  } else if (Math.abs(value) >= 10000) {
    return `${Math.round(value / 100)}億`;
  }
  return `${value.toLocaleString()}百万`;
}

function formatPercent(value: number): string {
  return `${value}%`;
}

export const FinancialChart = forwardRef<HTMLDivElement, FinancialChartProps>(
  function FinancialChart({ financials, activeTab }, ref) {
  const config = getChartConfig(financials, activeTab);
  if (!config) return null;

  return (
    <div ref={ref} className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">{config.title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={config.data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={config.xKey}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={config.leftFormatter}
            />
            {config.rightAxis && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={formatPercent}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value?: number, name?: string) => {
                const n = name || '';
                if (value == null) return ['—', n];
                if (n.includes('率') || n.includes('比率') || n.includes('性向') || n.includes('利回り')) {
                  return [`${value}%`, n];
                }
                if (n.includes('配当') && !n.includes('利回り')) {
                  return [`${value}円`, n];
                }
                return [formatYen(value), n];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {config.hasReferenceLine && (
              <ReferenceLine yAxisId="left" y={0} stroke="#9ca3af" strokeDasharray="3 3" />
            )}
            {config.bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                yAxisId="left"
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                radius={[4, 4, 0, 0]}
                barSize={config.bars.length > 2 ? 20 : 30}
              />
            ))}
            {config.lines.map((line) => (
              <Line
                key={line.dataKey}
                yAxisId={line.yAxisId || 'right'}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 3, fill: line.color }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

interface ChartConfig {
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  leftFormatter: (value: number) => string;
  rightAxis: boolean;
  hasReferenceLine: boolean;
  bars: { dataKey: string; name: string; color: string }[];
  lines: { dataKey: string; name: string; color: string; yAxisId?: string }[];
}

function getChartConfig(financials: CompanyFinancials, tab: FinancialTabType): ChartConfig | null {
  switch (tab) {
    case 'results':
      return {
        title: '業績推移',
        data: financials.annualResults.map((r) => ({
          year: r.fiscalYear,
          revenue: r.revenue,
          operatingIncome: r.operatingIncome,
          operatingMargin: r.operatingMargin,
        })),
        xKey: 'year',
        leftFormatter: formatYen,
        rightAxis: true,
        hasReferenceLine: false,
        bars: [
          { dataKey: 'revenue', name: '売上高', color: '#3b82f6' },
          { dataKey: 'operatingIncome', name: '営業利益', color: '#22c55e' },
        ],
        lines: [
          { dataKey: 'operatingMargin', name: '営業利益率', color: '#f97316' },
        ],
      };

    case 'quarterly':
      return {
        title: '四半期業績',
        data: financials.quarterlyResults.map((r) => ({
          period: r.period,
          revenue: r.revenue,
          operatingIncome: r.operatingIncome,
        })),
        xKey: 'period',
        leftFormatter: formatYen,
        rightAxis: false,
        hasReferenceLine: false,
        bars: [
          { dataKey: 'revenue', name: '売上高', color: '#3b82f6' },
          { dataKey: 'operatingIncome', name: '営業利益', color: '#22c55e' },
        ],
        lines: [],
      };

    case 'balance':
      return {
        title: '財務状況推移',
        data: financials.balanceSheets.map((r) => ({
          year: r.fiscalYear,
          totalAssets: r.totalAssets,
          netAssets: r.netAssets,
          equityRatio: r.equityRatio,
        })),
        xKey: 'year',
        leftFormatter: formatYen,
        rightAxis: true,
        hasReferenceLine: false,
        bars: [
          { dataKey: 'totalAssets', name: '総資産', color: '#3b82f6' },
          { dataKey: 'netAssets', name: '純資産', color: '#22c55e' },
        ],
        lines: [
          { dataKey: 'equityRatio', name: '自己資本比率', color: '#f97316' },
        ],
      };

    case 'cashflow':
      return {
        title: 'キャッシュフロー推移',
        data: financials.cashFlows.map((r) => ({
          year: r.fiscalYear,
          operatingCF: r.operatingCF,
          investingCF: r.investingCF,
          financingCF: r.financingCF,
          freeCF: r.freeCF,
        })),
        xKey: 'year',
        leftFormatter: formatYen,
        rightAxis: false,
        hasReferenceLine: true,
        bars: [
          { dataKey: 'operatingCF', name: '営業CF', color: '#3b82f6' },
          { dataKey: 'investingCF', name: '投資CF', color: '#ef4444' },
          { dataKey: 'financingCF', name: '財務CF', color: '#9ca3af' },
        ],
        lines: [
          { dataKey: 'freeCF', name: 'フリーCF', color: '#22c55e', yAxisId: 'left' },
        ],
      };

    case 'dividend':
      return {
        title: '配当推移',
        data: financials.dividends.map((r) => ({
          year: r.fiscalYear,
          dividendPerShare: r.dividendPerShare,
          payoutRatio: r.payoutRatio,
        })),
        xKey: 'year',
        leftFormatter: (v: number) => `${v}円`,
        rightAxis: true,
        hasReferenceLine: false,
        bars: [
          { dataKey: 'dividendPerShare', name: '一株配当', color: '#3b82f6' },
        ],
        lines: [
          { dataKey: 'payoutRatio', name: '配当性向', color: '#f97316' },
        ],
      };

    case 'metrics':
      return {
        title: '収益性・資本効率トレンド',
        data: financials.annualResults.map((r, i) => {
          const bs = financials.balanceSheets[i];
          const cf = financials.cashFlows[i];
          const investedCapital = bs ? bs.shareholdersEquity + bs.interestBearingDebt : 1;
          const roic = investedCapital > 0
            ? Math.round((r.operatingIncome * 0.7 / investedCapital) * 10000) / 100
            : 0;
          const fcfMargin = cf
            ? Math.round((cf.freeCF / r.revenue) * 10000) / 100
            : 0;
          const netMargin = Math.round((r.netIncome / r.revenue) * 10000) / 100;
          return {
            year: r.fiscalYear,
            roe: r.roe,
            roa: r.roa,
            roic,
            operatingMargin: r.operatingMargin,
            netMargin,
            fcfMargin,
          };
        }),
        xKey: 'year',
        leftFormatter: formatPercent,
        rightAxis: false,
        hasReferenceLine: true,
        bars: [],
        lines: [
          { dataKey: 'roe', name: 'ROE', color: '#3b82f6', yAxisId: 'left' },
          { dataKey: 'roic', name: 'ROIC', color: '#22c55e', yAxisId: 'left' },
          { dataKey: 'operatingMargin', name: '営業利益率', color: '#f97316', yAxisId: 'left' },
          { dataKey: 'netMargin', name: '純利益率', color: '#8b5cf6', yAxisId: 'left' },
          { dataKey: 'fcfMargin', name: 'FCFマージン', color: '#06b6d4', yAxisId: 'left' },
          { dataKey: 'roa', name: 'ROA', color: '#9ca3af', yAxisId: 'left' },
        ],
      };

    case 'cost_analysis':
      return {
        title: '費用構造分析（販管費率 vs 営業利益率）',
        data: financials.annualResults.map((r, i) => {
          const costRatio = Math.round((1 - r.operatingIncome / r.revenue) * 10000) / 100;
          // 売上成長率
          const prev = i > 0 ? financials.annualResults[i - 1] : null;
          const revenueGrowth = prev
            ? Math.round(((r.revenue - prev.revenue) / prev.revenue) * 10000) / 100
            : 0;
          const netMargin = Math.round((r.netIncome / r.revenue) * 10000) / 100;
          return {
            year: r.fiscalYear,
            operatingMargin: r.operatingMargin,
            costRatio,
            netMargin,
            revenueGrowth,
          };
        }),
        xKey: 'year',
        leftFormatter: formatPercent,
        rightAxis: false,
        hasReferenceLine: true,
        bars: [],
        lines: [
          { dataKey: 'operatingMargin', name: '営業利益率', color: '#22c55e', yAxisId: 'left' },
          { dataKey: 'costRatio', name: '費用比率', color: '#ef4444', yAxisId: 'left' },
          { dataKey: 'netMargin', name: '純利益率', color: '#8b5cf6', yAxisId: 'left' },
          { dataKey: 'revenueGrowth', name: '売上成長率', color: '#3b82f6', yAxisId: 'left' },
        ],
      };

    case 'per_band': {
      // PER = 株価 / EPS。各年の EPS × PER Range で推定株価帯を計算
      const latestPrice = financials.annualResults.length > 0
        ? financials.annualResults[financials.annualResults.length - 1].eps *
          (financials.summary.per || 15)
        : 0;
      return {
        title: 'PER バンド（EPS × 倍率レンジ）',
        data: financials.annualResults.map((r) => {
          const eps = r.eps;
          return {
            year: r.fiscalYear,
            eps,
            'PER10x': Math.round(eps * 10),
            'PER15x': Math.round(eps * 15),
            'PER20x': Math.round(eps * 20),
            'PER25x': Math.round(eps * 25),
            currentPrice: Math.round(latestPrice),
          };
        }),
        xKey: 'year',
        leftFormatter: (v: number) => `${v.toLocaleString()}円`,
        rightAxis: false,
        hasReferenceLine: false,
        bars: [],
        lines: [
          { dataKey: 'PER10x', name: 'PER 10倍', color: '#22c55e', yAxisId: 'left' },
          { dataKey: 'PER15x', name: 'PER 15倍', color: '#3b82f6', yAxisId: 'left' },
          { dataKey: 'PER20x', name: 'PER 20倍', color: '#f97316', yAxisId: 'left' },
          { dataKey: 'PER25x', name: 'PER 25倍', color: '#ef4444', yAxisId: 'left' },
        ],
      };
    }

    default:
      return null;
  }
}
