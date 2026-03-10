import { memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BusinessSegment } from '../../features/company/types/financials.types';

interface SegmentBreakdownSectionProps {
  segments: BusinessSegment[];
}

function fmtCurrency(v: number): string {
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}兆円`;
  if (Math.abs(v) >= 10000) return `${Math.round(v / 100).toLocaleString()}億円`;
  return `${v.toLocaleString()}百万円`;
}

export const SegmentBreakdownSection = memo(function SegmentBreakdownSection({ segments }: SegmentBreakdownSectionProps) {
  if (segments.length === 0) return null;

  const totalRevenue = segments.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">セグメント構成</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Donut Chart */}
        <div className="w-full md:w-1/3 flex items-center justify-center">
          <div className="w-56 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="revenue"
                  nameKey="name"
                >
                  {segments.map((seg, index) => (
                    <Cell key={index} fill={seg.color} />
                  ))}
                </Pie>
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [fmtCurrency(Number(value) || 0), '売上高']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="w-full md:w-2/3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-2 text-gray-500 font-medium">セグメント</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">売上高</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">構成比</th>
                <th className="text-right py-2 pl-2 text-gray-500 font-medium">営業利益</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg) => (
                <tr key={seg.name} className="border-b border-gray-100">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-gray-800">{seg.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium text-gray-900">
                    {fmtCurrency(seg.revenue)}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(seg.revenue / totalRevenue * 100).toFixed(0)}%`,
                            backgroundColor: seg.color,
                          }}
                        />
                      </div>
                      <span className="text-gray-700 w-10 text-right">{seg.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 pl-2 text-right font-medium text-gray-900">
                    {fmtCurrency(seg.operatingIncome)}
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
