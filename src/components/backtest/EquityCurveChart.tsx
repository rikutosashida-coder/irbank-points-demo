import { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface EquityCurveChartProps {
  data: { date: string; value: number }[];
}

function EquityCurveChartInner({ data }: EquityCurveChartProps) {
  const initial = data[0]?.value ?? 1000000;
  const final = data[data.length - 1]?.value ?? initial;
  const isPositive = final >= initial;

  // 月ラベル用にデータを間引き
  const ticks = useMemo(() => {
    if (data.length === 0) return [];
    const step = Math.max(1, Math.floor(data.length / 6));
    const result: string[] = [];
    for (let i = 0; i < data.length; i += step) {
      result.push(data[i].date);
    }
    if (result[result.length - 1] !== data[data.length - 1].date) {
      result.push(data[data.length - 1].date);
    }
    return result;
  }, [data]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 0];
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.1 || 50000;
    return [Math.floor((min - pad) / 10000) * 10000, Math.ceil((max + pad) / 10000) * 10000];
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        エクイティカーブデータなし
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v: string) => v.slice(5)} // MM-DD
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}万`}
            width={50}
          />
          <Tooltip
            formatter={(v) => [`¥${Number(v).toLocaleString()}`, '評価額']}
            labelFormatter={(l) => String(l)}
            contentStyle={{ fontSize: 12 }}
          />
          <ReferenceLine y={initial} stroke="#6b7280" strokeDasharray="3 3" strokeWidth={1} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            fill="url(#equityGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
        <span>開始: ¥{initial.toLocaleString()}</span>
        <span className={isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          終了: ¥{final.toLocaleString()} ({isPositive ? '+' : ''}{((final / initial - 1) * 100).toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}

export const EquityCurveChart = memo(EquityCurveChartInner);
