import { useMemo, useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { useInvestmentDecisionStore } from '../../features/notes/store/investmentDecisionStore';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PerformanceViewProps {
  noteId: string;
}

type ChartTab = 'valuation' | 'profitLoss';

export function PerformanceView({ noteId }: PerformanceViewProps) {
  const getDecisionsByNoteId = useInvestmentDecisionStore(
    (state) => state.getDecisionsByNoteId
  );
  const [chartTab, setChartTab] = useState<ChartTab>('valuation');

  const decisions = getDecisionsByNoteId(noteId);

  // パフォーマンス計算
  const performance = useMemo(() => {
    let totalInvestment = 0;
    let totalShares = 0;
    let totalSales = 0;

    decisions.forEach((decision) => {
      if (decision.tradeDetails) {
        if (decision.decisionType === 'buy') {
          totalInvestment += decision.tradeDetails.totalAmount;
          totalShares += decision.tradeDetails.shares;
        } else if (decision.decisionType === 'sell') {
          totalSales += decision.tradeDetails.totalAmount;
          totalShares -= decision.tradeDetails.shares;
        }
      }
    });

    // 平均取得単価
    const avgPurchasePrice = totalShares > 0 ? totalInvestment / totalShares : 0;

    // 現在の株価（モック: 最新の取引価格を使用）
    const latestTrade = [...decisions]
      .filter((d) => d.tradeDetails)
      .sort((a, b) => b.tradeDetails!.executeDate.getTime() - a.tradeDetails!.executeDate.getTime())[0];
    const currentPrice = latestTrade?.tradeDetails?.pricePerShare || avgPurchasePrice;

    // 現在の評価額
    const currentValue = totalShares * currentPrice;

    // 実現損益（売却済み）
    const realizedProfitLoss = totalSales - (totalInvestment - (totalShares * avgPurchasePrice));

    // 未実現損益（保有中）
    const unrealizedProfitLoss = currentValue - (totalShares * avgPurchasePrice);

    // 総損益
    const totalProfitLoss = realizedProfitLoss + unrealizedProfitLoss;

    // 損益率
    const profitLossRate = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      totalShares,
      avgPurchasePrice,
      currentPrice,
      currentValue,
      realizedProfitLoss,
      unrealizedProfitLoss,
      totalProfitLoss,
      profitLossRate,
      hasTrades: decisions.some((d) => d.tradeDetails),
    };
  }, [decisions]);

  // チャート用データ: 取引ごとの評価額推移
  const chartData = useMemo(() => {
    const trades = decisions
      .filter((d) => d.tradeDetails)
      .sort((a, b) => a.tradeDetails!.executeDate.getTime() - b.tradeDetails!.executeDate.getTime());

    if (trades.length === 0) return [];

    let runningShares = 0;
    let runningInvestment = 0;
    const dataPoints: {
      date: string;
      rawDate: Date;
      valuation: number;
      investment: number;
      profitLoss: number;
      shares: number;
      price: number;
      type: string;
    }[] = [];

    trades.forEach((trade) => {
      const td = trade.tradeDetails!;
      const dateStr = new Date(td.executeDate).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      });

      if (trade.decisionType === 'buy') {
        runningShares += td.shares;
        runningInvestment += td.totalAmount;
      } else if (trade.decisionType === 'sell') {
        runningShares -= td.shares;
        runningInvestment = runningShares > 0
          ? runningInvestment * (runningShares / (runningShares + td.shares))
          : 0;
      }

      const valuation = runningShares * td.pricePerShare;

      dataPoints.push({
        date: dateStr,
        rawDate: new Date(td.executeDate),
        valuation,
        investment: runningInvestment,
        profitLoss: valuation - runningInvestment,
        shares: runningShares,
        price: td.pricePerShare,
        type: trade.decisionType === 'buy' ? '買い' : '売り',
      });
    });

    // 現在時点のデータも追加（最新取引から変化がある場合）
    if (dataPoints.length > 0) {
      const lastPoint = dataPoints[dataPoints.length - 1];
      const now = new Date();
      const lastDate = lastPoint.rawDate;
      // 最新取引が今日でなければ「現在」ポイントを追加
      if (
        now.getDate() !== lastDate.getDate() ||
        now.getMonth() !== lastDate.getMonth() ||
        now.getFullYear() !== lastDate.getFullYear()
      ) {
        dataPoints.push({
          date: '現在',
          rawDate: now,
          valuation: performance.currentValue,
          investment: runningInvestment,
          profitLoss: performance.currentValue - runningInvestment,
          shares: runningShares,
          price: performance.currentPrice,
          type: '-',
        });
      }
    }

    return dataPoints;
  }, [decisions, performance]);

  if (!performance.hasTrades) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FiPieChart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">売買記録がありません</p>
        <p className="text-xs text-gray-500">
          投資判断で「買い」または「売り」を記録すると、パフォーマンスが表示されます
        </p>
      </div>
    );
  }

  const isProfit = performance.totalProfitLoss >= 0;

  const formatYen = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 総損益 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">総損益</h3>
            {isProfit ? (
              <FiTrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <FiTrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p
            className={`text-3xl font-bold ${
              isProfit ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isProfit ? '+' : ''}
            {performance.totalProfitLoss.toLocaleString()}円
          </p>
          <p
            className={`text-sm mt-1 ${
              isProfit ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isProfit ? '+' : ''}
            {performance.profitLossRate.toFixed(2)}%
          </p>
        </div>

        {/* 総投資額 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">総投資額</h3>
            <FiDollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {performance.totalInvestment.toLocaleString()}円
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {performance.totalShares.toLocaleString()}株保有中
          </p>
        </div>

        {/* 評価額 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">現在の評価額</h3>
            <FiPieChart className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {performance.currentValue.toLocaleString()}円
          </p>
          <p className="text-sm text-gray-500 mt-1">
            現在株価: {performance.currentPrice.toLocaleString()}円
          </p>
        </div>
      </div>

      {/* チャートセクション */}
      {chartData.length >= 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">推移</h3>
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => setChartTab('valuation')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartTab === 'valuation'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                評価額
              </button>
              <button
                onClick={() => setChartTab('profitLoss')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartTab === 'profitLoss'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                損益
              </button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === 'valuation' ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYen}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-xs">
                          <p className="font-semibold text-gray-900 mb-1">{data.date}</p>
                          <p className="text-blue-600">
                            評価額: {data.valuation.toLocaleString()}円
                          </p>
                          <p className="text-gray-500">
                            投資額: {data.investment.toLocaleString()}円
                          </p>
                          <p className="text-gray-500">
                            保有: {data.shares.toLocaleString()}株 @ {data.price.toLocaleString()}円
                          </p>
                          {data.type !== '-' && (
                            <p className={`mt-1 font-medium ${data.type === '買い' ? 'text-green-600' : 'text-red-600'}`}>
                              {data.type}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="investment"
                    stroke="#9ca3af"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="url(#colorInvestment)"
                    name="投資額"
                  />
                  <Area
                    type="monotone"
                    dataKey="valuation"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorValuation)"
                    name="評価額"
                    dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYen}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      const pl = data.profitLoss;
                      return (
                        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-xs">
                          <p className="font-semibold text-gray-900 mb-1">{data.date}</p>
                          <p className={pl >= 0 ? 'text-green-600' : 'text-red-600'}>
                            損益: {pl >= 0 ? '+' : ''}{pl.toLocaleString()}円
                          </p>
                          <p className="text-gray-500">
                            評価額: {data.valuation.toLocaleString()}円
                          </p>
                          <p className="text-gray-500">
                            投資額: {data.investment.toLocaleString()}円
                          </p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                  <Bar
                    dataKey="profitLoss"
                    name="損益"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.profitLoss >= 0 ? '#22c55e' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* 凡例 */}
          {chartTab === 'valuation' && (
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500 rounded" />
                <span className="text-xs text-gray-500">評価額</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-400 rounded" style={{ borderTop: '2px dashed #9ca3af' }} />
                <span className="text-xs text-gray-500">投資額</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 詳細情報 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">詳細</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* 平均取得単価 */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">平均取得単価</span>
            <span className="text-sm font-semibold text-gray-900">
              {performance.avgPurchasePrice.toLocaleString()}円
            </span>
          </div>

          {/* 保有株数 */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">保有株数</span>
            <span className="text-sm font-semibold text-gray-900">
              {performance.totalShares.toLocaleString()}株
            </span>
          </div>

          {/* 実現損益 */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">実現損益</span>
            <span
              className={`text-sm font-semibold ${
                performance.realizedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {performance.realizedProfitLoss >= 0 ? '+' : ''}
              {performance.realizedProfitLoss.toLocaleString()}円
            </span>
          </div>

          {/* 未実現損益 */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">未実現損益</span>
            <span
              className={`text-sm font-semibold ${
                performance.unrealizedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {performance.unrealizedProfitLoss >= 0 ? '+' : ''}
              {performance.unrealizedProfitLoss.toLocaleString()}円
            </span>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs text-amber-800">
          ※ 現在の株価は最新の取引価格を使用しています。実際の市場価格とは異なる場合があります。
        </p>
        <p className="text-xs text-amber-800 mt-1">
          ※ 実現損益は売却済みの取引、未実現損益は保有中の株式の含み損益を示します。
        </p>
      </div>
    </div>
  );
}
