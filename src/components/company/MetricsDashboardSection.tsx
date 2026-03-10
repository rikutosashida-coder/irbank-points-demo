import { memo } from 'react';
import { MetricsDashboard } from '../../features/company/types/financials.types';

interface MetricsDashboardSectionProps {
  dashboard: MetricsDashboard;
}

interface MetricItem {
  label: string;
  value: number;
  format: 'percent' | 'ratio' | 'times';
  goodIf?: 'high' | 'low';
  threshold?: [number, number]; // [good, warning]
}

const CATEGORIES: {
  key: keyof MetricsDashboard;
  title: string;
  color: string;
  borderColor: string;
  metrics: MetricItem[];
}[] = [
  {
    key: 'profitability',
    title: '収益性',
    color: 'bg-blue-50',
    borderColor: 'border-t-blue-500',
    metrics: [
      { label: '営業利益率', value: 0, format: 'percent', goodIf: 'high', threshold: [10, 5] },
      { label: '純利益率', value: 0, format: 'percent', goodIf: 'high', threshold: [7, 3] },
      { label: 'ROE', value: 0, format: 'percent', goodIf: 'high', threshold: [10, 5] },
      { label: 'ROA', value: 0, format: 'percent', goodIf: 'high', threshold: [5, 2] },
      { label: 'ROIC', value: 0, format: 'percent', goodIf: 'high', threshold: [8, 4] },
    ],
  },
  {
    key: 'growth',
    title: '成長性',
    color: 'bg-green-50',
    borderColor: 'border-t-green-500',
    metrics: [
      { label: '売上成長率(3Y)', value: 0, format: 'percent', goodIf: 'high', threshold: [10, 0] },
      { label: '営業利益成長率(3Y)', value: 0, format: 'percent', goodIf: 'high', threshold: [15, 0] },
      { label: 'EPS成長率(3Y)', value: 0, format: 'percent', goodIf: 'high', threshold: [15, 0] },
      { label: '売上CAGR(5Y)', value: 0, format: 'percent', goodIf: 'high', threshold: [8, 0] },
    ],
  },
  {
    key: 'stability',
    title: '安全性',
    color: 'bg-yellow-50',
    borderColor: 'border-t-yellow-500',
    metrics: [
      { label: '自己資本比率', value: 0, format: 'percent', goodIf: 'high', threshold: [50, 30] },
      { label: '流動比率', value: 0, format: 'percent', goodIf: 'high', threshold: [200, 100] },
      { label: 'インタレストカバレッジ', value: 0, format: 'times', goodIf: 'high', threshold: [10, 3] },
      { label: 'D/Eレシオ', value: 0, format: 'ratio', goodIf: 'low', threshold: [0.5, 1.0] },
      { label: 'ネットD/E', value: 0, format: 'ratio', goodIf: 'low', threshold: [0.3, 0.8] },
    ],
  },
  {
    key: 'valuation',
    title: '割安性',
    color: 'bg-purple-50',
    borderColor: 'border-t-purple-500',
    metrics: [
      { label: 'PER', value: 0, format: 'times', goodIf: 'low', threshold: [15, 25] },
      { label: 'PBR', value: 0, format: 'times', goodIf: 'low', threshold: [1.0, 2.0] },
      { label: 'PCFR', value: 0, format: 'times', goodIf: 'low', threshold: [10, 20] },
      { label: 'EV/EBITDA', value: 0, format: 'times', goodIf: 'low', threshold: [8, 15] },
      { label: '配当利回り', value: 0, format: 'percent', goodIf: 'high', threshold: [3, 1.5] },
    ],
  },
];

function getMetricValues(dashboard: MetricsDashboard, key: keyof MetricsDashboard): number[] {
  const data = dashboard[key];
  return Object.values(data) as number[];
}

function formatMetric(value: number, format: string): string {
  switch (format) {
    case 'percent': return `${value.toFixed(1)}%`;
    case 'ratio': return `${value.toFixed(2)}`;
    case 'times': return `${value.toFixed(1)}倍`;
    default: return `${value}`;
  }
}

function getColor(value: number, goodIf?: 'high' | 'low', threshold?: [number, number]): string {
  if (!goodIf || !threshold) return 'text-gray-900';
  const [good, warn] = threshold;

  if (goodIf === 'high') {
    if (value >= good) return 'text-green-600';
    if (value < warn) return 'text-red-600';
    return 'text-gray-900';
  } else {
    if (value <= good) return 'text-green-600';
    if (value > warn) return 'text-red-600';
    return 'text-gray-900';
  }
}

export const MetricsDashboardSection = memo(function MetricsDashboardSection({ dashboard }: MetricsDashboardSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">指標ダッシュボード</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const values = getMetricValues(dashboard, cat.key);
          return (
            <div
              key={cat.key}
              className={`${cat.color} border border-gray-200 border-t-4 ${cat.borderColor} rounded-xl p-4`}
            >
              <h3 className="text-sm font-bold text-gray-800 mb-3">{cat.title}</h3>
              <div className="space-y-2">
                {cat.metrics.map((metric, i) => {
                  const val = values[i] ?? 0;
                  return (
                    <div key={metric.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{metric.label}</span>
                      <span className={`text-sm font-bold ${getColor(val, metric.goodIf, metric.threshold)}`}>
                        {formatMetric(val, metric.format)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
