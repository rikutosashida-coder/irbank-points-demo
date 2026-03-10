import { memo } from 'react';
import { FiFileText, FiExternalLink } from 'react-icons/fi';
import { CompanySummary } from '../../features/company/types/financials.types';

interface CompanyHeaderProps {
  summary: CompanySummary;
  relatedNotesCount: number;
  onCreateNote: () => void;
  onViewNotes: () => void;
}

const MARKET_COLORS: Record<string, string> = {
  Prime: 'bg-blue-100 text-blue-800',
  Standard: 'bg-green-100 text-green-800',
  Growth: 'bg-purple-100 text-purple-800',
};

function formatLargeNumber(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}兆`;
  }
  return `${value.toLocaleString()}億`;
}

export const CompanyHeader = memo(function CompanyHeader({ summary, relatedNotesCount, onCreateNote, onViewNotes }: CompanyHeaderProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      {/* Company Name + Market */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{summary.stockName}</h1>
        <span className="text-lg text-gray-500">({summary.stockCode})</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${MARKET_COLORS[summary.market]}`}>
          {summary.market}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span>{summary.sector}</span>
        <span>/</span>
        <span>{summary.industry}</span>
      </div>

      {/* Stock Price */}
      <div className="mb-5 flex items-baseline gap-3">
        <div>
          <span className="text-3xl font-bold text-gray-900">
            {summary.currentPrice.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 ml-1">円</span>
        </div>
        {summary.priceChange != null && summary.priceChangeAmount != null && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            summary.priceChange > 0 ? 'text-green-600' : summary.priceChange < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            <span>
              {summary.priceChangeAmount > 0 ? '+' : ''}{summary.priceChangeAmount.toLocaleString()}円
            </span>
            <span>
              ({summary.priceChange > 0 ? '+' : ''}{summary.priceChange.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
        <MetricBadge label="時価総額" value={`${formatLargeNumber(summary.marketCap)}円`} />
        <MetricBadge label="PER" value={`${summary.per}倍`} />
        <MetricBadge label="PBR" value={`${summary.pbr}倍`} />
        <MetricBadge label="配当利回り" value={`${summary.dividendYield}%`} />
        <MetricBadge label="ROE" value={`${summary.roe}%`} color={summary.roe >= 10 ? 'text-green-600' : undefined} />
        <MetricBadge label="ROA" value={`${summary.roa}%`} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCreateNote}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
        >
          <FiFileText className="w-4 h-4" />
          この銘柄を分析する
        </button>
        {relatedNotesCount > 0 && (
          <button
            onClick={onViewNotes}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <FiExternalLink className="w-4 h-4" />
            関連ノート {relatedNotesCount}件
          </button>
        )}
      </div>
    </div>
  );
});

function MetricBadge({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-sm font-bold ${color || 'text-gray-900'}`}>{value}</div>
    </div>
  );
}
