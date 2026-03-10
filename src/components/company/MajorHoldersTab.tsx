import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiUserPlus, FiUserCheck, FiChevronRight } from 'react-icons/fi';
import { useShareholderStore } from '../../features/shareholders/store/shareholderStore';

const TYPE_LABEL: Record<string, { label: string; cls: string }> = {
  individual: { label: '個人', cls: 'bg-orange-100 text-orange-700' },
  institution: { label: '機関', cls: 'bg-blue-100 text-blue-700' },
  fund: { label: 'ファンド', cls: 'bg-purple-100 text-purple-700' },
};

interface MajorHoldersTabProps {
  stockCode: string;
}

export function MajorHoldersTab({ stockCode }: MajorHoldersTabProps) {
  const navigate = useNavigate();
  const { getHoldersForStock, getFilingsForStock, isFollowing, toggleFollow } = useShareholderStore();

  const holders = useMemo(() => getHoldersForStock(stockCode), [stockCode, getHoldersForStock]);
  const filings = useMemo(() => getFilingsForStock(stockCode), [stockCode, getFilingsForStock]);

  return (
    <div className="space-y-6">
      {/* ─── 大口保有者一覧 ─── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800">5%以上保有の大口投資家</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">大量保有報告書に基づく情報</p>
        </div>
        {holders.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-xs">
            5%以上保有する大口投資家の報告はありません
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {holders.map((h) => {
              const typeInfo = TYPE_LABEL[h.type] || TYPE_LABEL.individual;
              const following = isFollowing(h.shareholderId);
              return (
                <div key={h.shareholderId} className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => navigate(`/shareholder/${h.shareholderId}`)}
                    className="flex-1 flex items-center gap-3 text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                      {h.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-medium text-gray-800 group-hover:text-primary-600 truncate">{h.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${typeInfo.cls}`}>{typeInfo.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span>保有比率 <strong className="text-gray-700">{h.percentage.toFixed(1)}%</strong></span>
                        <span>{(h.shares / 10000).toLocaleString()}万株</span>
                        <span>最終報告 {h.latestFilingDate}</span>
                      </div>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFollow(h.shareholderId); }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition-colors flex-shrink-0 ${
                      following
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                  >
                    {following ? <FiUserCheck className="w-3 h-3" /> : <FiUserPlus className="w-3 h-3" />}
                    {following ? 'フォロー中' : 'フォロー'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 保有比率チャート ─── */}
      {holders.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">保有比率</h3>
          <div className="space-y-2">
            {holders.map((h) => (
              <div key={h.shareholderId} className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500 w-28 truncate">{h.name}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(h.percentage * 8, 100)}%` }}
                  >
                    <span className="text-[9px] font-bold text-white">{h.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 大量保有報告書 提出履歴 ─── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800">大量保有報告書 提出履歴</h3>
        </div>
        {filings.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-xs">
            大量保有報告書の提出履歴はありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-gray-400 border-b border-gray-100">
                  <th className="text-left px-4 py-2 font-medium">提出日</th>
                  <th className="text-left px-2 py-2 font-medium">報告者</th>
                  <th className="text-center px-2 py-2 font-medium">種別</th>
                  <th className="text-right px-2 py-2 font-medium">変動</th>
                  <th className="text-right px-2 py-2 font-medium">新保有比率</th>
                  <th className="text-left px-4 py-2 font-medium">目的</th>
                </tr>
              </thead>
              <tbody>
                {filings.map((f) => {
                  const diff = f.newPercent - f.previousPercent;
                  return (
                    <tr
                      key={f.id}
                      onClick={() => navigate(`/shareholder/${f.holderId}`)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{f.date}</td>
                      <td className="px-2 py-2.5 text-gray-800 font-medium">{f.holderName}</td>
                      <td className="px-2 py-2.5 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          f.type === '取得' ? 'bg-green-100 text-green-700' :
                          f.type === '処分' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {f.type}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <span className={`font-medium flex items-center justify-end gap-0.5 ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {diff >= 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                          {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right font-bold text-gray-900">{f.newPercent.toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-gray-500">{f.purpose}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
