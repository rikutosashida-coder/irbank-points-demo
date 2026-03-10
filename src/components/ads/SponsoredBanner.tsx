import { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// 新日本空調のモックデータ（売上高と株価推移）
function generateAdData() {
  const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025E'];
  const revenues = [1320, 1280, 1350, 1410, 1520, 1680, 1780]; // 億円
  const stockPrices = [2100, 1850, 2300, 2650, 3200, 4100, 4850]; // 円
  return years.map((year, i) => ({
    year,
    revenue: revenues[i],
    stockPrice: stockPrices[i],
  }));
}

export function SponsoredBanner() {
  const data = useMemo(() => generateAdData(), []);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200/60 rounded-xl overflow-hidden">
      {/* AD ラベル */}
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="text-[9px] font-medium text-gray-400 tracking-wider uppercase">Sponsored</span>
        <span className="text-[9px] text-gray-300">AD</span>
      </div>

      {/* メインコンテンツ */}
      <div className="px-3 pt-1 pb-2">
        {/* 企業名 */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">SNK</span>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900">新日本空調</div>
            <div className="text-[10px] text-gray-400">1952 / 東証プライム</div>
          </div>
        </div>

        {/* 訴求コピー */}
        <p className="text-[11px] text-gray-700 leading-relaxed mb-2">
          <span className="font-semibold text-blue-700">売上高6期連続増収</span>、株価は5年で
          <span className="font-semibold text-green-600">+130%</span>。
          データセンター空調需要の拡大で成長加速中。
        </p>

        {/* ミニチャート（売上高＋株価） */}
        <div className="h-24 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="adRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" orientation="left" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={35} tickFormatter={(v: number) => `${v}`} />
              <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={35} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
              <Bar yAxisId="rev" dataKey="revenue" fill="#3b82f6" opacity={0.25} barSize={14} radius={[2, 2, 0, 0]} />
              <Area yAxisId="price" type="monotone" dataKey="stockPrice" stroke="#22c55e" strokeWidth={2} fill="url(#adRevenueGrad)" dot={{ r: 2, fill: '#22c55e' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 凡例 */}
        <div className="flex items-center justify-center gap-4 mt-1 mb-2">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-blue-500/30 rounded-sm" />
            <span className="text-[9px] text-gray-500">売上高（億円）</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500 rounded" />
            <span className="text-[9px] text-gray-500">株価（円）</span>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <div className="bg-white/70 rounded-md px-2 py-1.5 text-center">
            <div className="text-[9px] text-gray-400">PER</div>
            <div className="text-xs font-bold text-gray-800">12.3倍</div>
          </div>
          <div className="bg-white/70 rounded-md px-2 py-1.5 text-center">
            <div className="text-[9px] text-gray-400">配当利回り</div>
            <div className="text-xs font-bold text-green-600">3.2%</div>
          </div>
          <div className="bg-white/70 rounded-md px-2 py-1.5 text-center">
            <div className="text-[9px] text-gray-400">ROE</div>
            <div className="text-xs font-bold text-gray-800">14.8%</div>
          </div>
        </div>

        {/* CTAボタン */}
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
          新日本空調の詳細を見る →
        </button>
      </div>
    </div>
  );
}
