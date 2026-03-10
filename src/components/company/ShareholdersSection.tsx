import { memo } from 'react';
import { Shareholder } from '../../features/company/types/financials.types';

interface ShareholdersSectionProps {
  shareholders: Shareholder[];
}

const TYPE_LABELS: Record<Shareholder['type'], { label: string; color: string }> = {
  institution: { label: '法人', color: 'bg-blue-100 text-blue-700' },
  bank: { label: '銀行', color: 'bg-green-100 text-green-700' },
  insurance: { label: '保険', color: 'bg-yellow-100 text-yellow-700' },
  trust: { label: '信託', color: 'bg-purple-100 text-purple-700' },
  foreign: { label: '外国', color: 'bg-orange-100 text-orange-700' },
  individual: { label: '個人', color: 'bg-gray-100 text-gray-700' },
  treasury: { label: '自己株', color: 'bg-red-100 text-red-700' },
};

export const ShareholdersSection = memo(function ShareholdersSection({ shareholders }: ShareholdersSectionProps) {
  if (shareholders.length === 0) return null;

  const maxPercentage = Math.max(...shareholders.map((s) => s.percentage));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">大株主</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-2 text-gray-500 font-medium w-8">#</th>
            <th className="text-left py-2 pr-2 text-gray-500 font-medium">株主名</th>
            <th className="text-left py-2 px-2 text-gray-500 font-medium">種別</th>
            <th className="text-right py-2 px-2 text-gray-500 font-medium">保有株数</th>
            <th className="text-right py-2 pl-2 text-gray-500 font-medium w-48">持株比率</th>
          </tr>
        </thead>
        <tbody>
          {shareholders.map((sh, i) => {
            const typeInfo = TYPE_LABELS[sh.type];
            return (
              <tr key={sh.name} className="border-b border-gray-100">
                <td className="py-2.5 pr-2 text-gray-400">{i + 1}</td>
                <td className="py-2.5 pr-2 text-gray-800 font-medium">{sh.name}</td>
                <td className="py-2.5 px-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right text-gray-700">
                  {sh.shares.toLocaleString()}千株
                </td>
                <td className="py-2.5 pl-2">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(sh.percentage / maxPercentage * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-medium w-12 text-right">
                      {sh.percentage.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
