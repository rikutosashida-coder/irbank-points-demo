import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FiPlus, FiX, FiChevronDown, FiChevronRight, FiEye, FiEyeOff, FiCamera, FiDownload, FiCopy, FiLink, FiEdit3 } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import html2canvas from 'html2canvas';
import { CompanyFinancials } from '../../features/company/types/financials.types';
import { getCompanyFinancials, getAvailableStocks } from '../../services/api/companyFinancialsApi';
import { InsertToNoteDialog } from './InsertToNoteDialog';
import { usePeerCompareStore } from '../../features/company/store/peerCompareStore';

// ============================================
// 型定義
// ============================================

type ChartType = 'line' | 'bar' | 'area' | 'pie';
type ScaleMode = 'normal' | 'percent' | 'log' | 'index100' | 'auto';

interface MetricDef {
  id: string;
  label: string;
  unit: 'yen' | 'percent' | 'ratio' | 'count';
  getter: (r: CompanyFinancials, yearIdx: number) => number;
}

interface ChartStock {
  code: string;
  name: string;
  color: string;
  visible: boolean;
}

interface ChartMetric {
  id: string;
  label: string;
  visible: boolean;
  axis: 'left' | 'right';
  chartType: ChartType;
}

interface ChartPanel {
  id: string;
  label: string;
  collapsed: boolean;
  scaleMode: ScaleMode;
  stocks: ChartStock[];
  metrics: ChartMetric[];
}

// ============================================
// 定数
// ============================================

const CHART_COLORS = [
  '#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#eab308', '#14b8a6', '#f43f5e',
];

const YEAR_COUNT = 10;

const METRIC_DEFS: MetricDef[] = [
  { id: 'revenue', label: '売上高', unit: 'yen', getter: (c, i) => c.annualResults[i]?.revenue ?? 0 },
  { id: 'operatingIncome', label: '営業利益', unit: 'yen', getter: (c, i) => c.annualResults[i]?.operatingIncome ?? 0 },
  { id: 'ordinaryIncome', label: '経常利益', unit: 'yen', getter: (c, i) => c.annualResults[i]?.ordinaryIncome ?? 0 },
  { id: 'netIncome', label: '純利益', unit: 'yen', getter: (c, i) => c.annualResults[i]?.netIncome ?? 0 },
  { id: 'operatingMargin', label: '営業利益率', unit: 'percent', getter: (c, i) => c.annualResults[i]?.operatingMargin ?? 0 },
  { id: 'roe', label: 'ROE', unit: 'percent', getter: (c, i) => c.annualResults[i]?.roe ?? 0 },
  { id: 'roa', label: 'ROA', unit: 'percent', getter: (c, i) => c.annualResults[i]?.roa ?? 0 },
  { id: 'eps', label: 'EPS', unit: 'ratio', getter: (c, i) => c.annualResults[i]?.eps ?? 0 },
  { id: 'equityRatio', label: '自己資本比率', unit: 'percent', getter: (c, i) => c.balanceSheets[i]?.equityRatio ?? 0 },
  { id: 'per', label: 'PER', unit: 'ratio', getter: (c, i) => {
    const eps = c.annualResults[i]?.eps;
    return eps && eps > 0 ? Math.round((c.summary.currentPrice / eps) * 100) / 100 : 0;
  }},
  { id: 'pbr', label: 'PBR', unit: 'ratio', getter: (c, i) => {
    const bps = c.balanceSheets[i]?.bps;
    return bps && bps > 0 ? Math.round((c.summary.currentPrice / bps) * 100) / 100 : 0;
  }},
  { id: 'dividendYield', label: '配当利回り', unit: 'percent', getter: (c, i) => c.dividends[i]?.dividendYield ?? 0 },
  { id: 'freeCF', label: 'フリーCF', unit: 'yen', getter: (c, i) => c.cashFlows[i]?.freeCF ?? 0 },
  { id: 'totalAssets', label: '総資産', unit: 'yen', getter: (c, i) => c.balanceSheets[i]?.totalAssets ?? 0 },
  { id: 'netAssets', label: '純資産', unit: 'yen', getter: (c, i) => c.balanceSheets[i]?.netAssets ?? 0 },
];

const SCALE_LABELS: Record<ScaleMode, string> = {
  normal: '通常',
  percent: '%',
  log: '対数',
  index100: '100基準',
  auto: '自動',
};

function formatYen(value: number): string {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}兆`;
  if (Math.abs(value) >= 10000) return `${Math.round(value / 100)}億`;
  if (Math.abs(value) >= 100) return `${(value / 100).toFixed(0)}億`;
  return `${value.toLocaleString()}百万`;
}

function createPanel(counter: number): ChartPanel {
  return {
    id: `chart-${Date.now()}-${counter}`,
    label: `グラフ${counter}`,
    collapsed: false,
    scaleMode: 'normal',
    stocks: [],
    metrics: [],
  };
}

// ============================================
// Props
// ============================================

interface PeerComparePanelProps {
  stockCode?: string;
  financials?: CompanyFinancials;
  standalone?: boolean;
}

// ============================================
// メインコンポーネント
// ============================================

type LayoutColumns = 1 | 2 | 3;

export function PeerComparePanel({ stockCode, financials, standalone }: PeerComparePanelProps) {
  const availableStocks = useMemo(() => getAvailableStocks(), []);
  const [layoutColumns, setLayoutColumns] = useState<LayoutColumns>(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [noteInsertData, setNoteInsertData] = useState<{ blocks: any[]; label: string } | null>(null);
  const panelCounterRef = useRef(0);

  // 全企業データキャッシュ
  const [dataCache, setDataCache] = useState<Map<string, CompanyFinancials>>(() => {
    const m = new Map<string, CompanyFinancials>();
    if (stockCode && financials) {
      m.set(stockCode, financials);
    }
    return m;
  });

  // チャートパネル配列
  const [panels, setPanels] = useState<ChartPanel[]>(() => {
    panelCounterRef.current = 1;
    const p = createPanel(1);
    if (stockCode && financials) {
      p.stocks = [{
        code: stockCode,
        name: financials.summary.stockName,
        color: CHART_COLORS[0],
        visible: true,
      }];
      p.metrics = [
        { id: 'revenue', label: '売上高', visible: true, axis: 'left', chartType: 'bar' },
        { id: 'operatingIncome', label: '営業利益', visible: true, axis: 'right', chartType: 'line' },
      ];
    } else {
      p.metrics = [
        { id: 'revenue', label: '売上高', visible: true, axis: 'left', chartType: 'bar' },
      ];
    }
    return [p];
  });

  // standalone: グローバルストアから銘柄読み込み
  useEffect(() => {
    if (!standalone) return;
    const { selectedCodes, dataCache: storeCache } = usePeerCompareStore.getState();
    if (selectedCodes.length === 0) return;

    // ストアのデータをローカルキャッシュにマージ
    const merged = new Map(dataCache);
    storeCache.forEach((v, k) => merged.set(k, v));
    setDataCache(merged);

    // まだロードされていない銘柄をロード
    const unloaded = selectedCodes.filter(code => !merged.has(code));
    if (unloaded.length > 0) {
      Promise.all(unloaded.map(c => getCompanyFinancials(c))).then(results => {
        setDataCache(prev => {
          const next = new Map(prev);
          results.forEach((data, i) => { if (data) next.set(unloaded[i], data); });
          return next;
        });
      });
    }

    // パネル[0]にストアの銘柄を設定
    setPanels(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        const stocksFromStore = selectedCodes.map((code, i) => ({
          code,
          name: storeCache.get(code)?.summary.stockName ?? code,
          color: CHART_COLORS[i % CHART_COLORS.length],
          visible: true,
        }));
        updated[0] = { ...updated[0], stocks: stocksFromStore };
      }
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standalone]);

  // 銘柄選択ドロップダウンの開閉
  const [openStockSelector, setOpenStockSelector] = useState<string | null>(null);
  const [openMetricSelector, setOpenMetricSelector] = useState<string | null>(null);
  const [loadingCodes, setLoadingCodes] = useState<Set<string>>(new Set());

  // データ読み込み
  const loadCompanyData = useCallback(async (code: string) => {
    if (dataCache.has(code)) return dataCache.get(code)!;
    setLoadingCodes(prev => new Set(prev).add(code));
    const data = await getCompanyFinancials(code);
    if (data) {
      setDataCache(prev => new Map(prev).set(code, data));
    }
    setLoadingCodes(prev => { const n = new Set(prev); n.delete(code); return n; });
    return data;
  }, [dataCache]);

  // パネル操作
  const updatePanel = useCallback((panelId: string, updater: (p: ChartPanel) => ChartPanel) => {
    setPanels(prev => prev.map(p => p.id === panelId ? updater(p) : p));
  }, []);

  const removePanel = useCallback((panelId: string) => {
    setPanels(prev => prev.filter(p => p.id !== panelId));
  }, []);

  const addPanel = useCallback(() => {
    panelCounterRef.current++;
    const p = createPanel(panelCounterRef.current);
    if (stockCode && financials) {
      p.stocks = [{
        code: stockCode,
        name: financials.summary.stockName,
        color: CHART_COLORS[0],
        visible: true,
      }];
    }
    p.metrics = [{ id: 'revenue', label: '売上高', visible: true, axis: 'left', chartType: 'bar' as ChartType }];
    setPanels(prev => [...prev, p]);
  }, [stockCode, financials]);

  const addStockToPanel = useCallback(async (panelId: string, code: string) => {
    const data = await loadCompanyData(code);
    if (!data) return;
    updatePanel(panelId, p => {
      if (p.stocks.find(s => s.code === code)) return p;
      const colorIdx = p.stocks.length % CHART_COLORS.length;
      return {
        ...p,
        stocks: [...p.stocks, {
          code,
          name: data.summary.stockName,
          color: CHART_COLORS[colorIdx],
          visible: true,
        }],
      };
    });
    setOpenStockSelector(null);
  }, [loadCompanyData, updatePanel]);

  const removeStockFromPanel = useCallback((panelId: string, code: string) => {
    updatePanel(panelId, p => ({
      ...p,
      stocks: p.stocks.filter(s => s.code !== code),
    }));
  }, [updatePanel]);

  const addMetricToPanel = useCallback((panelId: string, metricId: string) => {
    const def = METRIC_DEFS.find(m => m.id === metricId);
    if (!def) return;
    updatePanel(panelId, p => {
      if (p.metrics.find(m => m.id === metricId)) return p;
      return {
        ...p,
        metrics: [...p.metrics, { id: metricId, label: def.label, visible: true, axis: 'left', chartType: 'line' as ChartType }],
      };
    });
    setOpenMetricSelector(null);
  }, [updatePanel]);

  const removeMetricFromPanel = useCallback((panelId: string, metricId: string) => {
    updatePanel(panelId, p => ({
      ...p,
      metrics: p.metrics.filter(m => m.id !== metricId),
    }));
  }, [updatePanel]);

  // 年度ラベル取得（共通）
  const yearLabels = useMemo(() => {
    if (financials) {
      return financials.annualResults.slice(-YEAR_COUNT).map(r => r.fiscalYear);
    }
    // standalone: dataCacheの最初のエントリから取得
    const firstEntry = Array.from(dataCache.values())[0];
    if (!firstEntry) return [];
    return firstEntry.annualResults.slice(-YEAR_COUNT).map(r => r.fiscalYear);
  }, [financials, dataCache]);

  const gridClass = layoutColumns === 3
    ? 'grid grid-cols-1 lg:grid-cols-3 gap-4'
    : layoutColumns === 2
      ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
      : 'space-y-4';

  return (
    <div className="space-y-4">
      {/* レイアウト切替バー */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5">
        <span className="text-xs font-semibold text-gray-600">レイアウト</span>
        <div className="flex items-center gap-1">
          {([1, 2, 3] as LayoutColumns[]).map(cols => (
            <button
              key={cols}
              onClick={() => setLayoutColumns(cols)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                layoutColumns === cols
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={`${cols}列表示`}
            >
              {/* 列アイコン */}
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                {cols === 1 && (
                  <rect x="2" y="2" width="12" height="12" rx="1.5" opacity="0.8" />
                )}
                {cols === 2 && (
                  <>
                    <rect x="1" y="2" width="6" height="12" rx="1.5" opacity="0.8" />
                    <rect x="9" y="2" width="6" height="12" rx="1.5" opacity="0.8" />
                  </>
                )}
                {cols === 3 && (
                  <>
                    <rect x="0.5" y="2" width="4" height="12" rx="1" opacity="0.8" />
                    <rect x="6" y="2" width="4" height="12" rx="1" opacity="0.8" />
                    <rect x="11.5" y="2" width="4" height="12" rx="1" opacity="0.8" />
                  </>
                )}
              </svg>
              {cols}列
            </button>
          ))}
        </div>
      </div>

      {/* パネルグリッド */}
      <div className={gridClass}>
        {panels.map((panel) => (
          <ChartPanelCard
            key={panel.id}
            panel={panel}
            yearLabels={yearLabels}
            dataCache={dataCache}
            availableStocks={availableStocks}
            loadingCodes={loadingCodes}
            openStockSelector={openStockSelector}
            openMetricSelector={openMetricSelector}
            compact={layoutColumns > 1}
            onToggleCollapse={() => updatePanel(panel.id, p => ({ ...p, collapsed: !p.collapsed }))}
            onRemovePanel={() => removePanel(panel.id)}
            onSetScaleMode={(m) => updatePanel(panel.id, p => ({ ...p, scaleMode: m }))}
            onSetMetricChartType={(id, t) => updatePanel(panel.id, p => ({
              ...p, metrics: p.metrics.map(m => m.id === id ? { ...m, chartType: t } : m)
            }))}
            onToggleStockVisible={(code) => updatePanel(panel.id, p => ({
              ...p, stocks: p.stocks.map(s => s.code === code ? { ...s, visible: !s.visible } : s)
            }))}
            onChangeStockColor={(code, color) => updatePanel(panel.id, p => ({
              ...p, stocks: p.stocks.map(s => s.code === code ? { ...s, color } : s)
            }))}
            onToggleMetricVisible={(id) => updatePanel(panel.id, p => ({
              ...p, metrics: p.metrics.map(m => m.id === id ? { ...m, visible: !m.visible } : m)
            }))}
            onToggleMetricAxis={(id) => updatePanel(panel.id, p => ({
              ...p, metrics: p.metrics.map(m => m.id === id ? { ...m, axis: m.axis === 'left' ? 'right' : 'left' } : m)
            }))}
            onOpenStockSelector={() => setOpenStockSelector(openStockSelector === panel.id ? null : panel.id)}
            onOpenMetricSelector={() => setOpenMetricSelector(openMetricSelector === panel.id ? null : panel.id)}
            onAddStock={(code) => addStockToPanel(panel.id, code)}
            onRemoveStock={(code) => removeStockFromPanel(panel.id, code)}
            onAddMetric={(id) => addMetricToPanel(panel.id, id)}
            onRemoveMetric={(id) => removeMetricFromPanel(panel.id, id)}
            onInsertToNote={(dataUrl, label) => setNoteInsertData({
              blocks: [{ type: 'image', src: dataUrl, alt: label }],
              label,
            })}
          />
        ))}
      </div>

      {/* チャート追加ボタン */}
      <button
        onClick={addPanel}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2"
      >
        <FiPlus className="w-4 h-4" />
        チャートを追加
      </button>

      {/* ノート挿入ダイアログ */}
      {noteInsertData && (
        <InsertToNoteDialog
          blocks={noteInsertData.blocks}
          label={noteInsertData.label}
          stockCode={stockCode ?? panels[0]?.stocks[0]?.code ?? ''}
          stockName={
            financials?.summary.stockName
            ?? dataCache.get(panels[0]?.stocks[0]?.code ?? '')?.summary.stockName
            ?? '比較チャート'
          }
          onClose={() => setNoteInsertData(null)}
        />
      )}
    </div>
  );
}

// ============================================
// チャートパネルカード
// ============================================

interface ChartPanelCardProps {
  panel: ChartPanel;
  yearLabels: string[];
  dataCache: Map<string, CompanyFinancials>;
  availableStocks: { code: string; name: string }[];
  loadingCodes: Set<string>;
  openStockSelector: string | null;
  openMetricSelector: string | null;
  compact: boolean;
  onToggleCollapse: () => void;
  onRemovePanel: () => void;
  onSetScaleMode: (m: ScaleMode) => void;
  onSetMetricChartType: (id: string, t: ChartType) => void;
  onToggleStockVisible: (code: string) => void;
  onChangeStockColor: (code: string, color: string) => void;
  onToggleMetricVisible: (id: string) => void;
  onToggleMetricAxis: (id: string) => void;
  onOpenStockSelector: () => void;
  onOpenMetricSelector: () => void;
  onAddStock: (code: string) => void;
  onRemoveStock: (code: string) => void;
  onAddMetric: (id: string) => void;
  onRemoveMetric: (id: string) => void;
  onInsertToNote: (dataUrl: string, label: string) => void;
}

function ChartPanelCard({
  panel, yearLabels, dataCache, availableStocks, loadingCodes,
  openStockSelector, openMetricSelector, compact,
  onToggleCollapse, onRemovePanel, onSetScaleMode, onSetMetricChartType,
  onToggleStockVisible, onChangeStockColor,
  onToggleMetricVisible, onToggleMetricAxis,
  onOpenStockSelector, onOpenMetricSelector,
  onAddStock, onRemoveStock, onAddMetric, onRemoveMetric,
  onInsertToNote,
}: ChartPanelCardProps) {

  const panelRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [showScreenshotMenu, setShowScreenshotMenu] = useState(false);

  // 銘柄検索
  const [stockSearch, setStockSearch] = useState('');

  // パネルをキャプチャしてcanvasを返す
  const capturePanel = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!panelRef.current || capturing) return null;
    setCapturing(true);
    try {
      return await html2canvas(panelRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
    } catch {
      return null;
    } finally {
      setCapturing(false);
    }
  }, [capturing]);

  // 1. 画像をダウンロード
  const handleDownload = useCallback(async () => {
    setShowScreenshotMenu(false);
    const canvas = await capturePanel();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${panel.label}_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [capturePanel, panel.label]);

  // 2. 画像をコピー
  const handleCopyImage = useCallback(async () => {
    setShowScreenshotMenu(false);
    const canvas = await capturePanel();
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      }
    } catch {
      // clipboard API not supported
    }
  }, [capturePanel]);

  // 3. 画像のリンクをコピー
  const handleCopyLink = useCallback(async () => {
    setShowScreenshotMenu(false);
    const canvas = await capturePanel();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    try {
      await navigator.clipboard.writeText(dataUrl);
    } catch {
      // fallback
    }
  }, [capturePanel]);

  // 4. 画像をツイート
  const handleTweet = useCallback(async () => {
    setShowScreenshotMenu(false);
    // まずクリップボードにコピーしてからTwitterを開く
    const canvas = await capturePanel();
    if (canvas) {
      try {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        }
      } catch { /* */ }
    }
    const text = encodeURIComponent(`${panel.label} - 競合比較チャート`);
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
  }, [capturePanel, panel.label]);

  // 5. 画像をnoteへ
  const handleInsertToNote = useCallback(async () => {
    setShowScreenshotMenu(false);
    const canvas = await capturePanel();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onInsertToNote(dataUrl, `${panel.label} スクリーンショット`);
  }, [capturePanel, panel.label, onInsertToNote]);

  // チャートデータ計算
  const chartData = useMemo(() => {
    const visibleStocks = panel.stocks.filter(s => s.visible);
    const visibleMetrics = panel.metrics.filter(m => m.visible);
    if (visibleStocks.length === 0 || visibleMetrics.length === 0) return [];

    return yearLabels.map((year, yi) => {
      const point: Record<string, unknown> = { year };
      visibleStocks.forEach(stock => {
        const comp = dataCache.get(stock.code);
        if (!comp) return;
        const startIdx = comp.annualResults.length - yearLabels.length;
        const idx = startIdx + yi;
        if (idx < 0 || idx >= comp.annualResults.length) return;
        visibleMetrics.forEach(metric => {
          const def = METRIC_DEFS.find(d => d.id === metric.id);
          if (!def) return;
          let val = def.getter(comp, idx);

          // index100スケール
          if (panel.scaleMode === 'index100') {
            const baseIdx = startIdx;
            const baseVal = baseIdx >= 0 ? def.getter(comp, baseIdx) : 0;
            val = baseVal !== 0 ? (val / baseVal) * 100 : 0;
          }
          // %スケール（YoY）
          if (panel.scaleMode === 'percent' && idx > 0) {
            const prevVal = def.getter(comp, idx - 1);
            val = prevVal !== 0 ? ((val - prevVal) / Math.abs(prevVal)) * 100 : 0;
          }

          const key = `${stock.name}_${metric.id}`;
          point[key] = Math.round(val * 100) / 100;
        });
      });
      return point;
    });
  }, [panel, yearLabels, dataCache]);

  // 円グラフデータ（chartType==='pie'の指標のみ）
  const pieData = useMemo(() => {
    const visibleStocks = panel.stocks.filter(s => s.visible);
    const visibleMetrics = panel.metrics.filter(m => m.visible && m.chartType === 'pie');
    if (visibleMetrics.length === 0) return [];

    // 最新3年分の円グラフ
    const recentYears = yearLabels.slice(-3);
    return recentYears.map(year => {
      const yi = yearLabels.indexOf(year);
      return {
        year,
        metrics: visibleMetrics.map(metric => {
          const def = METRIC_DEFS.find(d => d.id === metric.id);
          if (!def) return { metricLabel: metric.label, data: [] };
          return {
            metricLabel: metric.label,
            data: visibleStocks.map(stock => {
              const comp = dataCache.get(stock.code);
              if (!comp) return { name: stock.name, value: 0, color: stock.color };
              const startIdx = comp.annualResults.length - yearLabels.length;
              const idx = startIdx + yi;
              return {
                name: stock.name,
                value: Math.abs(def.getter(comp, idx)),
                color: stock.color,
              };
            }).filter(d => d.value > 0),
          };
        }),
      };
    });
  }, [panel, yearLabels, dataCache]);

  // テーブルデータ
  const tableData = useMemo(() => {
    const visibleStocks = panel.stocks.filter(s => s.visible);
    const visibleMetrics = panel.metrics.filter(m => m.visible);
    if (visibleStocks.length === 0 || visibleMetrics.length === 0) return null;

    return {
      years: yearLabels.slice(-5),
      stocks: visibleStocks.map(stock => {
        const comp = dataCache.get(stock.code);
        return {
          ...stock,
          metricsData: visibleMetrics.map(metric => {
            const def = METRIC_DEFS.find(d => d.id === metric.id);
            return {
              metricId: metric.id,
              metricLabel: metric.label,
              unit: def?.unit ?? 'ratio',
              values: yearLabels.slice(-5).map(year => {
                const yi = yearLabels.indexOf(year);
                if (!comp || !def) return 0;
                const startIdx = comp.annualResults.length - yearLabels.length;
                return def.getter(comp, startIdx + yi);
              }),
            };
          }),
        };
      }),
    };
  }, [panel, yearLabels, dataCache]);

  const isOpen = !panel.collapsed;
  const panelStockCodes = panel.stocks.map(s => s.code);

  // Y軸フォーマッター
  const leftMetrics = panel.metrics.filter(m => m.visible && m.axis === 'left');
  const rightMetrics = panel.metrics.filter(m => m.visible && m.axis === 'right');
  const leftUnit = leftMetrics.length > 0 ? METRIC_DEFS.find(d => d.id === leftMetrics[0].id)?.unit : undefined;
  const rightUnit = rightMetrics.length > 0 ? METRIC_DEFS.find(d => d.id === rightMetrics[0].id)?.unit : undefined;

  const fmtAxis = (unit: string | undefined) => (v: number) => {
    if (panel.scaleMode === 'index100') return `${v}`;
    if (panel.scaleMode === 'percent') return `${v}%`;
    if (unit === 'yen') return formatYen(v);
    if (unit === 'percent') return `${v}%`;
    return `${v}`;
  };

  return (
    <div ref={panelRef} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          {isOpen ? <FiChevronDown className="w-4 h-4 text-gray-500" /> : <FiChevronRight className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-semibold text-gray-700">{panel.label}</span>
          <span className="text-[10px] text-gray-400">
            ({panel.stocks.length}銘柄 / {panel.metrics.length}指標)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* スクリーンショットメニュー */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowScreenshotMenu(prev => !prev); }}
              className={`p-1.5 rounded-md transition-colors ${
                capturing
                  ? 'text-blue-500 bg-blue-50 animate-pulse'
                  : showScreenshotMenu
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="スクリーンショット"
              disabled={capturing}
            >
              {capturing ? <FiDownload className="w-4 h-4" /> : <FiCamera className="w-4 h-4" />}
            </button>
            {showScreenshotMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setShowScreenshotMenu(false); }} />
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 w-52 py-1"
                  onClick={e => e.stopPropagation()}>
                  <button onClick={handleDownload}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiDownload className="w-4 h-4 text-gray-400" />
                    画像をダウンロード
                  </button>
                  <button onClick={handleCopyImage}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiCopy className="w-4 h-4 text-gray-400" />
                    画像をコピー
                  </button>
                  <button onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiLink className="w-4 h-4 text-gray-400" />
                    画像のリンクをコピー
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={handleTweet}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                    <FaXTwitter className="w-4 h-4 text-gray-400" />
                    画像をツイート
                  </button>
                  <button onClick={handleInsertToNote}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiEdit3 className="w-4 h-4 text-gray-400" />
                    画像をnoteへ
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemovePanel(); }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50"
            title="パネルを削除"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* 銘柄カード */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">銘柄</span>
              {panel.stocks.length < 10 && (
                <div className="relative">
                  <button onClick={onOpenStockSelector}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <FiPlus className="w-3.5 h-3.5" /> 銘柄追加
                  </button>
                  {openStockSelector === panel.id && (() => {
                    const q = stockSearch.trim().toLowerCase();
                    const filtered = availableStocks
                      .filter(s => !panelStockCodes.includes(s.code))
                      .filter(s => !q || s.code.includes(q) || s.name.toLowerCase().includes(q));
                    return (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => { onOpenStockSelector(); setStockSearch(''); }} />
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 w-72">
                          <div className="p-2.5 border-b border-gray-100">
                            <input
                              type="text"
                              value={stockSearch}
                              onChange={e => setStockSearch(e.target.value)}
                              placeholder="銘柄コード or 企業名で検索..."
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                              autoFocus
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-52 overflow-auto">
                            {filtered.length === 0 ? (
                              <div className="px-4 py-3 text-xs text-gray-400">該当なし</div>
                            ) : filtered.map(stock => {
                              const isLoading = loadingCodes.has(stock.code);
                              return (
                                <button key={stock.code} onClick={() => { onAddStock(stock.code); setStockSearch(''); }}
                                  className="w-full text-left px-4 py-2 text-xs hover:bg-blue-50 border-b border-gray-50 last:border-b-0 transition-colors"
                                  disabled={isLoading}>
                                  <span className="font-semibold text-gray-800">{stock.code}</span>
                                  <span className="text-gray-500 ml-2">{stock.name}</span>
                                  {isLoading && <span className="text-blue-400 ml-2 animate-pulse">読込中...</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className={`grid gap-2 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
              {panel.stocks.map(stock => (
                <div key={stock.code}
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 transition-all ${
                    stock.visible
                      ? 'bg-white shadow-sm'
                      : 'bg-gray-50 opacity-60'
                  }`}
                  style={{ borderColor: stock.visible ? stock.color : '#d1d5db' }}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: stock.color }} />
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${stock.visible ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                        {stock.name}
                      </div>
                      <div className="text-[10px] text-gray-400">{stock.code}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <label className="cursor-pointer p-0.5" title="色を変更">
                      <input type="color" value={stock.color}
                        onChange={(e) => onChangeStockColor(stock.code, e.target.value)}
                        className="w-0 h-0 opacity-0 absolute"
                      />
                      <span className="w-4 h-4 rounded border border-gray-300 block" style={{ backgroundColor: stock.color }} />
                    </label>
                    <button onClick={() => onToggleStockVisible(stock.code)}
                      className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                      title={stock.visible ? '非表示' : '表示'}>
                      {stock.visible ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => onRemoveStock(stock.code)}
                      className="p-1 rounded-md hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                      title="削除">
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 指標カード */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">指標</span>
              <div className="relative">
                <button onClick={onOpenMetricSelector}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <FiPlus className="w-3.5 h-3.5" /> 指標追加
                </button>
                {openMetricSelector === panel.id && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={onOpenMetricSelector} />
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 w-56 max-h-64 overflow-auto">
                      {METRIC_DEFS.filter(d => !panel.metrics.find(m => m.id === d.id)).map(def => (
                        <button key={def.id} onClick={() => onAddMetric(def.id)}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-green-50 border-b border-gray-50 last:border-b-0 transition-colors flex items-center justify-between">
                          <span className="font-medium text-gray-700">{def.label}</span>
                          <span className="text-[10px] text-gray-400 ml-2">
                            {def.unit === 'yen' ? '百万円' : def.unit === 'percent' ? '%' : '倍'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {panel.metrics.map(metric => (
                <div key={metric.id}
                  className={`rounded-lg border bg-white p-3 transition-all ${
                    metric.visible ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-50'
                  }`}>
                  {/* 指標ヘッダー */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${metric.visible ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                        {metric.label}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        metric.axis === 'left'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-orange-50 text-orange-600 border border-orange-200'
                      }`}>
                        {metric.axis === 'left' ? '左軸' : '右軸'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onToggleMetricAxis(metric.id)}
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        title="軸を切替（左/右）">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M4 2v12M12 2v12M1 5l3-3 3 3M9 11l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button onClick={() => onToggleMetricVisible(metric.id)}
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                        title={metric.visible ? '非表示' : '表示'}>
                        {metric.visible ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => onRemoveMetric(metric.id)}
                        className="p-1 rounded-md hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                        title="削除">
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* チャートタイプ選択 */}
                  <div className="flex items-center gap-1 mb-2">
                    {([
                      { type: 'line' as ChartType, icon: (
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2,12 5,6 9,9 14,3" />
                        </svg>
                      ), label: 'ライン' },
                      { type: 'bar' as ChartType, icon: (
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                          <rect x="1" y="8" width="3" height="6" rx="0.5" />
                          <rect x="5.5" y="4" width="3" height="10" rx="0.5" />
                          <rect x="10" y="6" width="3" height="8" rx="0.5" />
                        </svg>
                      ), label: '棒グラフ' },
                      { type: 'area' as ChartType, icon: (
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" opacity="0.3">
                          <path d="M2,12 L5,6 L9,9 L14,3 L14,14 L2,14 Z" />
                          <polyline points="2,12 5,6 9,9 14,3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ), label: '面グラフ' },
                      { type: 'pie' as ChartType, icon: (
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8,8 L8,2 A6,6 0 0,1 13,6 Z" opacity="0.7" />
                          <path d="M8,8 L13,6 A6,6 0 0,1 10,13 Z" opacity="0.5" />
                          <path d="M8,8 L10,13 A6,6 0 1,1 8,2 Z" opacity="0.3" />
                        </svg>
                      ), label: '円グラフ' },
                    ]).map(({ type, icon, label }) => (
                      <button key={type} onClick={() => onSetMetricChartType(metric.id, type)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                          metric.chartType === type
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                        }`}
                        title={label}>
                        {icon}
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                  {/* 関連銘柄（この指標に対してどの銘柄が表示されるか） */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {panel.stocks.filter(s => s.visible).map(stock => (
                      <span key={stock.code}
                        className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stock.color }} />
                        {stock.code}:{stock.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* スケール設定 */}
          <div className="flex items-center gap-1.5 border-t border-gray-100 pt-3">
            <span className="text-[10px] text-gray-500 mr-1">スケール:</span>
            {(Object.keys(SCALE_LABELS) as ScaleMode[]).map(m => (
              <button key={m}
                onClick={() => onSetScaleMode(m)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  panel.scaleMode === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {SCALE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* チャート描画（ComposedChart: line/bar/area を混在表示） */}
          {(() => {
            const nonPieMetrics = panel.metrics.filter(m => m.visible && m.chartType !== 'pie');
            const pieMetrics = panel.metrics.filter(m => m.visible && m.chartType === 'pie');
            return (
              <>
                {nonPieMetrics.length > 0 && (
                  <div className={compact ? 'h-56' : 'h-80'}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickFormatter={fmtAxis(leftUnit)}
                          scale={panel.scaleMode === 'log' ? 'log' : 'auto'}
                          domain={panel.scaleMode === 'log' ? [1, 'auto'] : ['auto', 'auto']}
                        />
                        {rightMetrics.length > 0 && (
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            tickFormatter={fmtAxis(rightUnit)}
                            scale={panel.scaleMode === 'log' ? 'log' : 'auto'}
                            domain={panel.scaleMode === 'log' ? [1, 'auto'] : ['auto', 'auto']}
                          />
                        )}
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '11px' }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any, name: any) => {
                            const parts = String(name ?? '').split('_');
                            const stockName = parts[0];
                            const metricId = parts.slice(1).join('_');
                            const def = METRIC_DEFS.find(d => d.id === metricId);
                            const v = Number(value ?? 0);
                            const formatted = def?.unit === 'yen' ? formatYen(v) : def?.unit === 'percent' ? `${v}%` : `${v}`;
                            return [formatted, `${stockName} - ${def?.label ?? metricId}`];
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px' }}
                          formatter={(value: string) => {
                            const parts = value.split('_');
                            const metricId = parts.slice(1).join('_');
                            const def = METRIC_DEFS.find(d => d.id === metricId);
                            return `${parts[0]} ${def?.label ?? ''}`;
                          }}
                        />
                        {panel.stocks.filter(s => s.visible).flatMap(stock =>
                          nonPieMetrics.map(metric => {
                            const key = `${stock.name}_${metric.id}`;
                            const yAxisId = metric.axis;
                            if (metric.chartType === 'bar') {
                              return <Bar key={key} yAxisId={yAxisId} dataKey={key} name={key} fill={stock.color} radius={[2, 2, 0, 0]} barSize={16} fillOpacity={0.85} />;
                            }
                            if (metric.chartType === 'area') {
                              return <Area key={key} yAxisId={yAxisId} type="monotone" dataKey={key} name={key} stroke={stock.color} fill={stock.color} fillOpacity={0.15} strokeWidth={2} />;
                            }
                            return <Line key={key} yAxisId={yAxisId} type="monotone" dataKey={key} name={key} stroke={stock.color} strokeWidth={2} dot={{ r: 3 }} />;
                          })
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {pieMetrics.length > 0 && (
                  <PieChartView pieData={pieData} />
                )}
              </>
            );
          })()}

          {/* テーブル表示 */}
          {tableData && (
            <div className="overflow-x-auto border-t border-gray-100 pt-3">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 pr-2 text-gray-500 font-medium">銘柄 / 指標</th>
                    {tableData.years.map(y => (
                      <th key={y} className="text-right py-1.5 px-2 text-gray-500 font-medium">{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.stocks.map(stock => (
                    stock.metricsData.map((md, mi) => (
                      <tr key={`${stock.code}-${md.metricId}`} className={`border-b border-gray-50 ${mi === 0 ? 'border-t border-gray-200' : ''}`}>
                        <td className="py-1.5 pr-2">
                          {mi === 0 && <span className="font-medium" style={{ color: stock.color }}>{stock.name}</span>}
                          {mi === 0 && ' '}
                          <span className="text-gray-500">{md.metricLabel}</span>
                        </td>
                        {md.values.map((v, vi) => (
                          <td key={vi} className="text-right py-1.5 px-2 text-gray-700 tabular-nums">
                            {md.unit === 'yen' ? formatYen(v) : md.unit === 'percent' ? `${v}%` : v.toFixed(1)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 円グラフビュー
// ============================================

function PieChartView({ pieData }: { pieData: { year: string; metrics: { metricLabel: string; data: { name: string; value: number; color: string }[] }[] }[] }) {
  if (pieData.length === 0) return <div className="text-center py-8 text-sm text-gray-400">データがありません</div>;

  return (
    <div className="space-y-4">
      {pieData.map(yearGroup => (
        <div key={yearGroup.year}>
          <h4 className="text-xs font-medium text-gray-600 mb-2">{yearGroup.year}</h4>
          <div className="flex flex-wrap gap-4">
            {yearGroup.metrics.map(metricGroup => (
              <div key={metricGroup.metricLabel} className="flex-1 min-w-[200px]">
                <p className="text-[10px] text-gray-500 text-center mb-1">{metricGroup.metricLabel}</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metricGroup.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        label={({ name, percent }: any) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={{ strokeWidth: 1 }}
                      >
                        {metricGroup.data.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => formatYen(Number(value ?? 0))}
                        contentStyle={{ fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
