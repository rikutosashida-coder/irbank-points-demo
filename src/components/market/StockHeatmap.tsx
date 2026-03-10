import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeatmapSector, HeatmapStock } from '../../services/api/marketApi';

interface StockHeatmapProps {
  data: HeatmapSector[];
}

// ============================================
// 色計算: 騰落率 → 背景色
// ============================================
function getChangeColor(change: number): string {
  if (change >= 5) return 'rgb(22, 101, 52)';     // green-800
  if (change >= 3) return 'rgb(21, 128, 61)';     // green-700
  if (change >= 1) return 'rgb(22, 163, 74)';     // green-600
  if (change >= 0.3) return 'rgb(74, 222, 128)';  // green-400
  if (change > -0.3) return 'rgb(156, 163, 175)'; // gray-400
  if (change > -1) return 'rgb(248, 113, 113)';   // red-400
  if (change > -3) return 'rgb(220, 38, 38)';     // red-600
  if (change > -5) return 'rgb(185, 28, 28)';     // red-700
  return 'rgb(153, 27, 27)';                       // red-800
}

function getTextColor(change: number): string {
  if (Math.abs(change) < 0.3) return '#374151'; // gray-700
  return '#ffffff';
}

// ============================================
// Squarified Treemap Algorithm
// ============================================
interface TreemapRect {
  x: number;
  y: number;
  w: number;
  h: number;
  data: HeatmapStock;
}

interface SectorRect {
  x: number;
  y: number;
  w: number;
  h: number;
  sector: string;
  stocks: TreemapRect[];
}

function squarify(
  items: { value: number; data: HeatmapStock }[],
  x: number,
  y: number,
  w: number,
  h: number,
): TreemapRect[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ x, y, w, h, data: items[0].data }];
  }

  const totalValue = items.reduce((s, i) => s + i.value, 0);
  if (totalValue === 0) return [];

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const rects: TreemapRect[] = [];

  let cx = x, cy = y, cw = w, ch = h;
  let remaining = [...sorted];
  let remainingValue = totalValue;

  while (remaining.length > 0) {
    const isWide = cw >= ch;
    const side = isWide ? ch : cw;

    // Find the row that gives best aspect ratio
    let row: typeof remaining = [];
    let rowValue = 0;
    let bestWorst = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = [...row, remaining[i]];
      const candidateValue = rowValue + remaining[i].value;
      const rowArea = (candidateValue / remainingValue) * cw * ch;
      const rowSide = rowArea / side;

      let worstAspect = 0;
      for (const item of candidate) {
        const itemSide = (item.value / candidateValue) * side;
        const aspect = Math.max(rowSide / itemSide, itemSide / rowSide);
        worstAspect = Math.max(worstAspect, aspect);
      }

      if (worstAspect <= bestWorst) {
        bestWorst = worstAspect;
        row = candidate;
        rowValue = candidateValue;
      } else {
        break;
      }
    }

    // Layout the row
    const rowFraction = rowValue / remainingValue;
    const rowThickness = isWide ? cw * rowFraction : ch * rowFraction;

    let offset = 0;
    for (const item of row) {
      const itemFraction = item.value / rowValue;
      const itemLength = side * itemFraction;

      if (isWide) {
        rects.push({ x: cx, y: cy + offset, w: rowThickness, h: itemLength, data: item.data });
      } else {
        rects.push({ x: cx + offset, y: cy, w: itemLength, h: rowThickness, data: item.data });
      }
      offset += itemLength;
    }

    // Update remaining area
    if (isWide) {
      cx += rowThickness;
      cw -= rowThickness;
    } else {
      cy += rowThickness;
      ch -= rowThickness;
    }

    remaining = remaining.slice(row.length);
    remainingValue -= rowValue;
  }

  return rects;
}

function layoutSectors(
  sectors: HeatmapSector[],
  width: number,
  height: number,
): SectorRect[] {
  const totalMarketCap = sectors.reduce(
    (s, sec) => s + sec.stocks.reduce((ss, st) => ss + st.marketCap, 0),
    0,
  );

  const sectorItems = sectors.map((sec) => ({
    value: sec.stocks.reduce((s, st) => s + st.marketCap, 0),
    sector: sec,
  }));

  // Layout sectors as a treemap
  const sorted = [...sectorItems].sort((a, b) => b.value - a.value);
  const sectorRects: SectorRect[] = [];

  let cx = 0, cy = 0, cw = width, ch = height;
  let remaining = [...sorted];
  let remainingValue = totalMarketCap;

  while (remaining.length > 0) {
    const isWide = cw >= ch;
    const side = isWide ? ch : cw;

    let row: typeof remaining = [];
    let rowValue = 0;
    let bestWorst = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = [...row, remaining[i]];
      const candidateValue = rowValue + remaining[i].value;
      const rowArea = (candidateValue / remainingValue) * cw * ch;
      const rowSide = rowArea / side;

      let worstAspect = 0;
      for (const item of candidate) {
        const itemSide = (item.value / candidateValue) * side;
        const aspect = Math.max(rowSide / itemSide, itemSide / rowSide);
        worstAspect = Math.max(worstAspect, aspect);
      }

      if (worstAspect <= bestWorst) {
        bestWorst = worstAspect;
        row = candidate;
        rowValue = candidateValue;
      } else {
        break;
      }
    }

    const rowFraction = rowValue / remainingValue;
    const rowThickness = isWide ? cw * rowFraction : ch * rowFraction;

    let offset = 0;
    for (const item of row) {
      const itemFraction = item.value / rowValue;
      const itemLength = side * itemFraction;

      const sx = isWide ? cx : cx + offset;
      const sy = isWide ? cy + offset : cy;
      const sw = isWide ? rowThickness : itemLength;
      const sh = isWide ? itemLength : rowThickness;

      // Layout stocks within sector with padding for the label
      const padding = 20; // for sector label
      const innerX = 0;
      const innerY = padding;
      const innerW = sw;
      const innerH = Math.max(sh - padding, 10);

      const stockItems = item.sector.stocks.map((st) => ({
        value: st.marketCap,
        data: st,
      }));

      const stockRects = squarify(stockItems, innerX, innerY, innerW, innerH);

      sectorRects.push({
        x: sx,
        y: sy,
        w: sw,
        h: sh,
        sector: item.sector.sector,
        stocks: stockRects,
      });

      offset += itemLength;
    }

    if (isWide) {
      cx += rowThickness;
      cw -= rowThickness;
    } else {
      cy += rowThickness;
      ch -= rowThickness;
    }

    remaining = remaining.slice(row.length);
    remainingValue -= rowValue;
  }

  return sectorRects;
}

// ============================================
// コンポーネント
// ============================================

export function StockHeatmap({ data }: StockHeatmapProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<{ stock: HeatmapStock; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setSize({ width, height: Math.max(480, width * 0.5) });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const sectorRects = useMemo(() => {
    if (size.width === 0) return [];
    return layoutSectors(data, size.width, size.height);
  }, [data, size]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-800">株式ヒートマップ</h2>
          <span className="text-[10px] text-gray-400">時価総額 × 日次変動率</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(22, 101, 52)' }} />
            <span className="text-gray-500">+5%↑</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(22, 163, 74)' }} />
            <span className="text-gray-500">+1%↑</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(156, 163, 175)' }} />
            <span className="text-gray-500">±0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(220, 38, 38)' }} />
            <span className="text-gray-500">-1%↓</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgb(153, 27, 27)' }} />
            <span className="text-gray-500">-5%↓</span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative select-none"
        style={{ height: size.height || 480 }}
        onMouseLeave={() => setTooltip(null)}
      >
        {sectorRects.map((sec) => (
          <div
            key={sec.sector}
            className="absolute border border-gray-300/50"
            style={{
              left: sec.x,
              top: sec.y,
              width: sec.w,
              height: sec.h,
            }}
          >
            {/* Sector Label */}
            {sec.w > 60 && (
              <div
                className="absolute top-0 left-0 right-0 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 bg-white/80 truncate z-10"
                style={{ height: 20 }}
              >
                {sec.sector}
              </div>
            )}

            {/* Stocks */}
            {sec.stocks.map((rect) => {
              const minDim = Math.min(rect.w, rect.h);
              const showTicker = minDim > 28;
              const showChange = rect.w > 40 && rect.h > 40;
              const showName = rect.w > 60 && rect.h > 55;
              const fontSize = minDim > 80 ? 13 : minDim > 50 ? 11 : 9;

              return (
                <div
                  key={rect.data.stockCode}
                  className="absolute flex flex-col items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    left: rect.x + 1,
                    top: rect.y + 1,
                    width: rect.w - 2,
                    height: rect.h - 2,
                    backgroundColor: getChangeColor(rect.data.change),
                    color: getTextColor(rect.data.change),
                  }}
                  onClick={() => navigate(`/company/${rect.data.stockCode}`)}
                  onMouseEnter={(e) => {
                    const bounds = containerRef.current?.getBoundingClientRect();
                    if (bounds) {
                      setTooltip({
                        stock: rect.data,
                        x: e.clientX - bounds.left,
                        y: e.clientY - bounds.top,
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    const bounds = containerRef.current?.getBoundingClientRect();
                    if (bounds) {
                      setTooltip({
                        stock: rect.data,
                        x: e.clientX - bounds.left,
                        y: e.clientY - bounds.top,
                      });
                    }
                  }}
                >
                  {showName && (
                    <span
                      className="font-bold leading-tight text-center truncate px-1"
                      style={{ fontSize: fontSize + 1 }}
                    >
                      {rect.data.shortName}
                    </span>
                  )}
                  {showTicker && !showName && (
                    <span className="font-bold leading-tight" style={{ fontSize }}>
                      {rect.data.stockCode}
                    </span>
                  )}
                  {showChange && (
                    <span className="font-semibold leading-tight" style={{ fontSize: fontSize - 1 }}>
                      {rect.data.change >= 0 ? '+' : ''}{rect.data.change.toFixed(1)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 pointer-events-none bg-gray-900 text-white rounded-lg px-3 py-2 text-xs shadow-lg"
            style={{
              left: Math.min(tooltip.x + 12, size.width - 180),
              top: Math.max(tooltip.y - 60, 8),
            }}
          >
            <div className="font-bold">{tooltip.stock.stockName}</div>
            <div className="text-gray-300">{tooltip.stock.stockCode}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-400">時価総額</span>
              <span>{tooltip.stock.marketCap.toLocaleString()}億円</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">変動率</span>
              <span className={tooltip.stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                {tooltip.stock.change >= 0 ? '+' : ''}{tooltip.stock.change.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
