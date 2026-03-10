import { forwardRef, useMemo, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Customized,
  usePlotArea,
  useYAxisDomain,
} from 'recharts';
import { FiMaximize2, FiX } from 'react-icons/fi';
import { StockPricePoint } from '../../features/company/types/financials.types';

// ============================================
// 期間定義
// ============================================

type PeriodKey = '1d' | '5d' | '1m' | '3m' | '6m' | '1y' | '3y' | '5y' | '10y' | 'all';
type ChartMode = 'line' | 'candlestick';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: '1d', label: '1日' },
  { key: '5d', label: '5日' },
  { key: '1m', label: '1ヶ月' },
  { key: '3m', label: '3ヶ月' },
  { key: '6m', label: '6ヶ月' },
  { key: '1y', label: '1年' },
  { key: '3y', label: '3年' },
  { key: '5y', label: '5年' },
  { key: '10y', label: '10年' },
  { key: 'all', label: '全期間' },
];

function getPeriodDays(key: PeriodKey): number {
  switch (key) {
    case '1d': return 1;
    case '5d': return 5;
    case '1m': return 22;
    case '3m': return 66;
    case '6m': return 132;
    case '1y': return 252;
    case '3y': return 756;
    case '5y': return 1260;
    case '10y': return 2520;
    case 'all': return Infinity;
  }
}

function getPeriodLabel(key: PeriodKey): string {
  return PERIODS.find(p => p.key === key)?.label || key;
}

// ============================================
// OHLC データ集約
// ============================================

interface OhlcvData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function aggregateToWeekly(data: OhlcvData[]): OhlcvData[] {
  if (data.length === 0) return [];
  const weeks: OhlcvData[] = [];
  let current: OhlcvData | null = null;
  for (const d of data) {
    const dt = new Date(d.date);
    if (!current || dt.getDay() <= new Date(current.date).getDay() || dt.getTime() - new Date(current.date).getTime() > 6 * 86400000) {
      if (current) weeks.push(current);
      current = { ...d };
    } else {
      current.high = Math.max(current.high, d.high);
      current.low = Math.min(current.low, d.low);
      current.close = d.close;
      current.volume += d.volume;
    }
  }
  if (current) weeks.push(current);
  return weeks;
}

function aggregateToMonthly(data: OhlcvData[]): OhlcvData[] {
  if (data.length === 0) return [];
  const months: OhlcvData[] = [];
  let current: OhlcvData | null = null;
  let currentMonth = '';
  for (const d of data) {
    const m = d.date.slice(0, 7);
    if (m !== currentMonth) {
      if (current) months.push(current);
      current = { ...d };
      currentMonth = m;
    } else if (current) {
      current.high = Math.max(current.high, d.high);
      current.low = Math.min(current.low, d.low);
      current.close = d.close;
      current.volume += d.volume;
    }
  }
  if (current) months.push(current);
  return months;
}

// ============================================
// ローソク足レイヤー（recharts v3 hooks）
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CandlestickLayer(props: any) {
  const data: OhlcvData[] = props.data;
  const plotArea = usePlotArea();
  const yDomain = useYAxisDomain('price');

  if (!plotArea || !yDomain || data.length === 0) return null;

  const domainMin = Number(yDomain[0]);
  const domainMax = Number(yDomain[yDomain.length - 1]);
  if (isNaN(domainMin) || isNaN(domainMax) || domainMax <= domainMin) return null;

  const yScale = (price: number) =>
    plotArea.y + ((domainMax - price) / (domainMax - domainMin)) * plotArea.height;

  const bandWidth = plotArea.width / data.length;

  return (
    <g className="candlestick-layer">
      {data.map((d, i) => {
        const cx = plotArea.x + (i + 0.5) * bandWidth;
        const yOpen = yScale(d.open);
        const yClose = yScale(d.close);
        const yHigh = yScale(d.high);
        const yLow = yScale(d.low);

        const isUp = d.close >= d.open;
        const fill = isUp ? '#22c55e' : '#ef4444';
        const stroke = isUp ? '#16a34a' : '#dc2626';

        const bodyTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(1, Math.abs(yOpen - yClose));
        const candleW = Math.max(1, Math.min(bandWidth * 0.6, 10));

        return (
          <g key={i}>
            <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={stroke} strokeWidth={1} />
            <rect
              x={cx - candleW / 2}
              y={bodyTop}
              width={candleW}
              height={bodyH}
              fill={fill}
              stroke={stroke}
              strokeWidth={0.5}
            />
          </g>
        );
      })}
    </g>
  );
}

// ============================================
// Y軸パディングレベル
// ============================================
const Y_PADDING_LEVELS = [0.002, 0.01, 0.02, 0.05, 0.12, 0.25];
const DEFAULT_Y_PADDING = 2; // index into Y_PADDING_LEVELS

// ============================================
// メインコンポーネント
// ============================================

interface StockPriceChartProps {
  priceHistory: StockPricePoint[];
  currentPrice: number;
  embedded?: boolean;
}

export const StockPriceChart = forwardRef<HTMLDivElement, StockPriceChartProps>(
  function StockPriceChart({ priceHistory, currentPrice, embedded }, ref) {
    const [period, setPeriod] = useState<PeriodKey>('1y');
    const [chartMode, setChartMode] = useState<ChartMode>('line');
    const [yPaddingLevel, setYPaddingLevel] = useState(DEFAULT_Y_PADDING);
    const [brushStart, setBrushStart] = useState(0);
    const [brushEnd, setBrushEnd] = useState(0);
    const [showExpanded, setShowExpanded] = useState(false);

    const filteredData = useMemo(() => {
      const days = getPeriodDays(period);
      if (days === Infinity) return priceHistory;
      return priceHistory.slice(-Math.min(days, priceHistory.length));
    }, [priceHistory, period]);

    const displayData = useMemo(() => {
      const data: OhlcvData[] = filteredData.map(p => ({
        date: p.date, open: p.open, high: p.high, low: p.low, close: p.close, volume: p.volume,
      }));
      if (period === '5y' || period === '10y' || period === 'all') return aggregateToMonthly(data);
      if (period === '3y') return aggregateToWeekly(data);
      return data;
    }, [filteredData, period]);

    // 期間変更時にBrushとYズームをリセット
    useEffect(() => {
      setBrushStart(0);
      setBrushEnd(displayData.length - 1);
      setYPaddingLevel(DEFAULT_Y_PADDING);
    }, [displayData.length]);

    // Brush範囲内の表示データ
    const visibleData = useMemo(() => {
      const s = Math.max(0, brushStart);
      const e = Math.min(displayData.length - 1, brushEnd);
      return displayData.slice(s, e + 1);
    }, [displayData, brushStart, brushEnd]);

    // Y軸ドメイン（表示データ + パディング）
    const { priceMin, priceMax } = useMemo(() => {
      const source = visibleData.length > 0 ? visibleData : displayData;
      if (source.length === 0) return { priceMin: 0, priceMax: 0 };
      const lo = Math.min(...source.map(d => d.low));
      const hi = Math.max(...source.map(d => d.high));
      const padding = (hi - lo) * Y_PADDING_LEVELS[yPaddingLevel];
      return { priceMin: lo - padding, priceMax: hi + padding };
    }, [visibleData, displayData, yPaddingLevel]);

    const stats = useMemo(() => {
      if (visibleData.length === 0) return null;
      const periodHigh = Math.max(...visibleData.map(p => p.high));
      const periodLow = Math.min(...visibleData.map(p => p.low));
      const firstClose = visibleData[0].close;
      const lastClose = visibleData[visibleData.length - 1].close;
      const change = ((lastClose - firstClose) / firstClose * 100).toFixed(1);
      return { periodHigh, periodLow, change };
    }, [visibleData]);

    const xTickFormatter = useCallback((d: string) => {
      if (period === '1d' || period === '5d' || period === '1m' || period === '3m' || period === '6m') {
        const parts = d.split('-');
        return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
      }
      if (period === '1y') return `${parseInt(d.slice(5, 7))}月`;
      const parts = d.split('-');
      return `${parts[0].slice(2)}/${parseInt(parts[1])}`;
    }, [period]);

    const xInterval = useMemo(() => {
      const len = visibleData.length;
      if (len <= 10) return 0;
      return Math.floor(len / 7);
    }, [visibleData]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tooltipContent = useCallback(({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) return null;
      const d = payload[0]?.payload;
      if (!d) return null;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
          <div className="font-medium text-gray-700 mb-1">{label}</div>
          {chartMode === 'candlestick' ? (
            <div className="space-y-0.5">
              <div className="flex justify-between gap-4"><span className="text-gray-500">始値</span><span>{d.open?.toLocaleString()}円</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-500">高値</span><span className="text-red-600">{d.high?.toLocaleString()}円</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-500">安値</span><span className="text-blue-600">{d.low?.toLocaleString()}円</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-500">終値</span><span className="font-bold">{d.close?.toLocaleString()}円</span></div>
              <div className="flex justify-between gap-4 border-t border-gray-100 pt-0.5"><span className="text-gray-500">出来高</span><span>{d.volume?.toLocaleString()}</span></div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="flex justify-between gap-4"><span className="text-gray-500">終値</span><span className="font-bold">{d.close?.toLocaleString()}円</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-500">出来高</span><span>{d.volume?.toLocaleString()}</span></div>
            </div>
          )}
        </div>
      );
    }, [chartMode]);

    // ESCキーでモーダルを閉じる
    useEffect(() => {
      if (!showExpanded) return;
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowExpanded(false); };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, [showExpanded]);

    if (priceHistory.length === 0) return null;

    const chartContent = (expanded: boolean) => (
      <>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-2">
          <h2 className={`${expanded ? 'text-lg' : 'text-sm'} font-bold text-gray-900`}>
            株価チャート（{getPeriodLabel(period)}）
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
              <button
                onClick={() => setChartMode('line')}
                className={`${expanded ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[10px]'} font-medium rounded transition-colors ${
                  chartMode === 'line' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ライン
              </button>
              <button
                onClick={() => setChartMode('candlestick')}
                className={`${expanded ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[10px]'} font-medium rounded transition-colors ${
                  chartMode === 'candlestick' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ローソク足
              </button>
            </div>
            {expanded ? (
              <button
                onClick={() => setShowExpanded(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="閉じる"
              >
                <FiX size={18} />
              </button>
            ) : (
              <button
                onClick={() => setShowExpanded(true)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="大きい画面で見る"
              >
                <FiMaximize2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 期間選択 */}
        <div className="flex items-center gap-0.5 mb-2 overflow-x-auto">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`${expanded ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[10px]'} font-medium rounded whitespace-nowrap transition-colors ${
                period === p.key ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* チャート本体 */}
        <div className={expanded ? 'h-[60vh]' : embedded ? 'h-64' : 'h-52'}>
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'line' ? (
              <ComposedChart data={displayData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id={expanded ? 'stockPriceGradientExpanded' : 'stockPriceGradient'} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={xTickFormatter} tick={{ fontSize: expanded ? 12 : 11, fill: '#9ca3af' }} interval={xInterval} />
                <YAxis yAxisId="price" orientation="right" tickFormatter={(v: number) => v.toLocaleString()} tick={{ fontSize: expanded ? 12 : 11, fill: '#9ca3af' }} domain={[priceMin, priceMax]} width={expanded ? 70 : 60} />
                <YAxis yAxisId="volume" orientation="left" tickFormatter={formatVolume} tick={{ fontSize: expanded ? 12 : 11, fill: '#9ca3af' }} domain={[0, 'auto']} width={expanded ? 60 : 50} />
                <Tooltip content={tooltipContent} />
                <Bar yAxisId="volume" dataKey="volume" fill="#e5e7eb" opacity={0.4} barSize={Math.max(1, Math.min(expanded ? 6 : 3, 600 / displayData.length))} />
                <Area yAxisId="price" type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fill={`url(#${expanded ? 'stockPriceGradientExpanded' : 'stockPriceGradient'})`} />
              </ComposedChart>
            ) : (
              <ComposedChart data={displayData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={xTickFormatter} tick={{ fontSize: expanded ? 12 : 11, fill: '#9ca3af' }} interval={xInterval} />
                <YAxis yAxisId="price" orientation="right" tickFormatter={(v: number) => v.toLocaleString()} tick={{ fontSize: expanded ? 12 : 11, fill: '#9ca3af' }} domain={[priceMin, priceMax]} width={expanded ? 70 : 60} />
                <YAxis yAxisId="volume" orientation="left" tickFormatter={formatVolume} tick={{ fontSize: expanded ? 12 : 11, fill: '#9ca3af' }} domain={[0, 'auto']} width={expanded ? 60 : 50} hide />
                <Tooltip content={tooltipContent} />
                <Line yAxisId="price" type="monotone" dataKey="close" stroke="none" dot={false} activeDot={false} isAnimationActive={false} />
                <Customized component={<CandlestickLayer data={visibleData} />} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* 統計 */}
        {stats && (
          <div className={`mt-4 grid grid-cols-4 ${expanded ? 'gap-6' : 'gap-4'}`}>
            <StatItem label="現在値" value={`${currentPrice.toLocaleString()}円`} expanded={expanded} />
            <StatItem label="期間高値" value={`${stats.periodHigh.toLocaleString()}円`} expanded={expanded} />
            <StatItem label="期間安値" value={`${stats.periodLow.toLocaleString()}円`} expanded={expanded} />
            <StatItem
              label="期間騰落率"
              value={`${Number(stats.change) > 0 ? '+' : ''}${stats.change}%`}
              color={Number(stats.change) > 0 ? 'text-green-600' : Number(stats.change) < 0 ? 'text-red-600' : undefined}
              expanded={expanded}
            />
          </div>
        )}
      </>
    );

    return (
      <>
        <div ref={ref} className={embedded ? '' : 'bg-white border border-gray-200 rounded-xl p-4'}>
          {chartContent(false)}
        </div>

        {/* 拡大モーダル */}
        {showExpanded && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowExpanded(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-[1200px] max-h-[90vh] overflow-auto p-6">
              {chartContent(true)}
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }
);

function StatItem({ label, value, color, expanded }: { label: string; value: string; color?: string; expanded?: boolean }) {
  return (
    <div className="text-center">
      <div className={`${expanded ? 'text-sm' : 'text-xs'} text-gray-500`}>{label}</div>
      <div className={`${expanded ? 'text-base' : 'text-sm'} font-bold ${color || 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

function formatVolume(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}
