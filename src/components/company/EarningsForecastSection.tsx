import { memo } from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { EarningsForecast, ShikihoCommentary } from '../../features/company/types/financials.types';

interface EarningsForecastSectionProps {
  forecast: EarningsForecast;
  commentary: ShikihoCommentary;
  companyName: string;
}

const OUTLOOK_STYLES = {
  positive: { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', icon: <FiTrendingUp className="w-4 h-4" /> },
  neutral: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <FiMinus className="w-4 h-4" /> },
  cautious: { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700', icon: <FiTrendingDown className="w-4 h-4" /> },
};

function fmtCurrency(v: number): string {
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}兆円`;
  if (Math.abs(v) >= 10000) return `${Math.round(v / 100).toLocaleString()}億円`;
  return `${v.toLocaleString()}百万円`;
}

function fmtYoY(v: number): string {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

function yoyColor(v: number): string {
  if (v > 0) return 'text-green-600';
  if (v < 0) return 'text-red-600';
  return 'text-gray-600';
}

export const EarningsForecastSection = memo(function EarningsForecastSection({ forecast, commentary, companyName }: EarningsForecastSectionProps) {
  const style = OUTLOOK_STYLES[commentary.outlook];

  const forecastItems = [
    { label: '売上高', value: fmtCurrency(forecast.revenueEstimate), yoy: forecast.revenueYoY },
    { label: '営業利益', value: fmtCurrency(forecast.operatingIncomeEstimate), yoy: forecast.operatingIncomeYoY },
    { label: '純利益', value: fmtCurrency(forecast.netIncomeEstimate), yoy: forecast.netIncomeYoY },
    { label: 'EPS', value: `${forecast.epsEstimate.toFixed(1)}円`, yoy: null },
    { label: '配当', value: `${forecast.dividendEstimate.toFixed(1)}円`, yoy: null },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        業績予想
      </h2>

      {/* Shikiho Commentary */}
      <div className={`${style.bg} border-l-4 ${style.border} rounded-r-lg p-4 mb-5`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={style.text}>{style.icon}</span>
          <span className={`font-bold ${style.text}`}>{commentary.headline}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{commentary.body}</p>
        <div className="mt-2 text-xs text-gray-400">更新: {commentary.updatedAt}</div>
      </div>

      {/* Forecast Table */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {companyName} {forecast.fiscalYear}期予想（{forecast.source === 'company' ? '会社予想' : 'コンセンサス'}）
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-gray-500 font-medium">項目</th>
                <th className="text-right py-2 px-4 text-gray-500 font-medium">予想値</th>
                <th className="text-right py-2 pl-4 text-gray-500 font-medium">前年比</th>
              </tr>
            </thead>
            <tbody>
              {forecastItems.map((item) => (
                <tr key={item.label} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-700">{item.label}</td>
                  <td className="py-2 px-4 text-right font-medium text-gray-900">{item.value}</td>
                  <td className={`py-2 pl-4 text-right font-medium ${item.yoy != null ? yoyColor(item.yoy) : 'text-gray-400'}`}>
                    {item.yoy != null ? fmtYoY(item.yoy) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
