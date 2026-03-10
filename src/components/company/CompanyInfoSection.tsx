import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, PieChart, Pie,
} from 'recharts';
import {
  CompanyProfile, CompanyInfoData, Shareholder, DividendData, Director,
} from '../../features/company/types/financials.types';

// ============================================
// サブタブ定義
// ============================================

type InfoSubTab = 'overview' | 'shareholders' | 'subsidiaries' | 'returns';

const INFO_SUB_TABS: { id: InfoSubTab; label: string }[] = [
  { id: 'overview', label: '概要' },
  { id: 'shareholders', label: '株主情報' },
  { id: 'subsidiaries', label: '関係会社・投資先' },
  { id: 'returns', label: '配当/株主還元' },
];

// ============================================
// 共通ヘルパー
// ============================================

function formatMillion(v: number): string {
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}兆`;
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(0)}億`;
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}十億`;
  return `${v.toLocaleString()}百万`;
}

function formatShares(v: number): string {
  if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)}億株`;
  if (v >= 10000000) return `${(v / 10000000).toFixed(0)}千万株`;
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万株`;
  return `${v.toLocaleString()}株`;
}

function SectionCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
      <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  );
}

// ============================================
// Props
// ============================================

interface CompanyInfoSectionProps {
  profile: CompanyProfile;
  companyInfo: CompanyInfoData;
  shareholders: Shareholder[];
  dividends: DividendData[];
}

// ============================================
// メインコンポーネント
// ============================================

export function CompanyInfoSection({ profile, companyInfo, shareholders, dividends }: CompanyInfoSectionProps) {
  const [subTab, setSubTab] = useState<InfoSubTab>('overview');

  return (
    <div className="space-y-4">
      {/* サブタブ */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {INFO_SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              subTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'overview' && <OverviewTab profile={profile} info={companyInfo} />}
      {subTab === 'shareholders' && <ShareholdersTab shareholders={shareholders} info={companyInfo} />}
      {subTab === 'subsidiaries' && <SubsidiariesTab info={companyInfo} />}
      {subTab === 'returns' && <ReturnsTab info={companyInfo} dividends={dividends} />}
    </div>
  );
}

// ============================================
// 概要タブ
// ============================================

function OverviewTab({ profile, info }: { profile: CompanyProfile; info: CompanyInfoData }) {
  return (
    <div className="space-y-4">
      {/* 企業プロフィール（MISSION / VISION / 業界ポジション / 事業内容） */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* 左: Mission / Vision */}
          <div>
            <div className="px-4 pt-3.5 pb-2.5">
              <div className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-1">Mission</div>
              <p className="text-sm font-semibold text-gray-900 leading-snug">「{profile.mission}」</p>
            </div>
            <div className="px-4 pb-3">
              <div className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-1">Vision</div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{profile.vision}</p>
            </div>
            <div className="px-4 pb-3 bg-blue-50/40 border-t border-gray-100">
              <div className="text-[9px] font-bold text-blue-500 tracking-wider uppercase mb-1 pt-2.5">業界ポジション</div>
              <p className="text-[11px] text-blue-900 font-medium leading-relaxed">{profile.industryPosition}</p>
            </div>
          </div>
          {/* 右: 事業内容 + 基本情報 */}
          <div className="border-t lg:border-t-0 lg:border-l border-gray-100">
            <div className="px-4 py-3">
              <div className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-1">事業内容</div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{profile.description}</p>
            </div>
            <div className="border-t border-gray-100" />
            <div className="grid grid-cols-2 text-[10px]">
              <div className="px-4 py-1.5 text-gray-400">{profile.ceo}（代表）</div>
              <div className="px-4 py-1.5 text-gray-600 text-right">設立 {profile.founded}</div>
              <div className="px-4 py-1 border-t border-gray-50 text-gray-400">従業員 {profile.employees.toLocaleString()}人</div>
              <div className="px-4 py-1 border-t border-gray-50 text-gray-600 text-right">平均年収 {profile.averageSalary.toLocaleString()}万円</div>
            </div>
          </div>
        </div>
      </div>

      {/* 会社概要 */}
      <SectionCard title="会社概要">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <InfoRow label="設立" value={profile.founded} />
          <InfoRow label="上場" value={profile.listingDate} />
          <InfoRow label="本社所在地" value={profile.headquarters} />
          <InfoRow label="代表者" value={profile.ceo} />
          <InfoRow label="決算月" value={profile.fiscalYearEnd} />
          <InfoRow label="従業員数" value={`${profile.employees.toLocaleString()}人`} />
          <InfoRow label="平均年齢" value={`${profile.averageAge}歳`} />
          <InfoRow label="平均年収" value={`${profile.averageSalary.toLocaleString()}万円`} />
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">{profile.description}</p>
        </div>
      </SectionCard>

      {/* 役員の状況 */}
      <DirectorsTable directors={info.directors} />

      {/* 役員報酬 */}
      <SectionCard title="役員報酬">
        <DirectorCompensationTable data={info.directorCompensation} />
      </SectionCard>

      {/* 1億以上の役員 & 監査報酬の推移 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="報酬1億円以上の役員">
          {info.highPaidDirectors.length === 0 ? (
            <p className="text-xs text-gray-400">該当なし</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="text-left py-1.5 font-medium">氏名</th>
                    <th className="text-left py-1.5 font-medium">役職</th>
                    <th className="text-right py-1.5 font-medium">固定</th>
                    <th className="text-right py-1.5 font-medium">業績</th>
                    <th className="text-right py-1.5 font-medium">株式</th>
                    <th className="text-right py-1.5 font-medium font-bold">合計</th>
                  </tr>
                </thead>
                <tbody>
                  {info.highPaidDirectors.map((d, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-900">{d.name}</td>
                      <td className="py-1.5 text-gray-600 text-[10px]">{d.position}</td>
                      <td className="py-1.5 text-right text-gray-700">{d.fixedComp}百万</td>
                      <td className="py-1.5 text-right text-gray-700">{d.performanceComp}百万</td>
                      <td className="py-1.5 text-right text-gray-700">{d.stockComp}百万</td>
                      <td className="py-1.5 text-right font-bold text-gray-900">{d.totalComp}百万</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="監査報酬の推移">
          <AuditFeeChart data={info.auditFees} />
        </SectionCard>
      </div>

      {/* 社員の状況 & 従業員の推移 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="社員の状況">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-1.5 font-medium">セグメント</th>
                  <th className="text-right py-1.5 font-medium">人数</th>
                  <th className="text-right py-1.5 font-medium">平均年齢</th>
                  <th className="text-right py-1.5 font-medium">勤続年数</th>
                  <th className="text-right py-1.5 font-medium">年収</th>
                </tr>
              </thead>
              <tbody>
                {info.employeeSegments.map((seg, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-900">{seg.segmentName}</td>
                    <td className="py-1.5 text-right text-gray-700">{seg.employeeCount.toLocaleString()}</td>
                    <td className="py-1.5 text-right text-gray-700">{seg.averageAge}歳</td>
                    <td className="py-1.5 text-right text-gray-700">{seg.averageTenure}年</td>
                    <td className="py-1.5 text-right text-gray-700">{seg.averageSalary.toLocaleString()}万</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="従業員の推移">
          <EmployeeTrendChart data={info.employeeTrends} />
        </SectionCard>
      </div>

      {/* 平均年収の推移 */}
      <SectionCard title="平均年収の推移">
        <SalaryTrendChart data={info.salaryTrends} />
      </SectionCard>

      {/* 借入金等の返済予定 & 主な資産及び負債の内訳 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="借入金等の返済予定">
          <DebtRepaymentTable data={info.debtRepayment} />
        </SectionCard>

        <SectionCard title="主な資産及び負債の内訳">
          <AssetLiabilityTable data={info.assetLiabilityBreakdown} />
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================
// 株主情報タブ
// ============================================

function ShareholdersTab({ shareholders, info }: { shareholders: Shareholder[]; info: CompanyInfoData }) {
  const typeLabels: Record<string, string> = {
    institution: '機関投資家', bank: '銀行', insurance: '保険', trust: '信託',
    foreign: '外国法人', individual: '個人', treasury: '自己株式',
  };
  const typeColors: Record<string, string> = {
    institution: '#3b82f6', bank: '#10b981', insurance: '#f59e0b', trust: '#8b5cf6',
    foreign: '#ef4444', individual: '#6366f1', treasury: '#6b7280',
  };

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    shareholders.forEach(s => { map[s.type] = (map[s.type] || 0) + s.percentage; });
    return Object.entries(map).map(([type, pct]) => ({
      name: typeLabels[type] || type, value: Math.round(pct * 10) / 10, fill: typeColors[type] || '#999',
    }));
  }, [shareholders]);

  const changeTypeLabels: Record<string, { text: string; color: string }> = {
    increase: { text: '増', color: 'text-red-600 bg-red-50' },
    decrease: { text: '減', color: 'text-blue-600 bg-blue-50' },
    new: { text: '新規', color: 'text-green-600 bg-green-50' },
    disposal: { text: '処分', color: 'text-gray-600 bg-gray-100' },
  };

  return (
    <div className="space-y-4">
      {/* 株式発行数・発行済み株式数 */}
      <SectionCard title="株式発行数・発行済み株式数">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 mb-0.5">発行可能株式総数</div>
            <div className="text-sm font-bold text-gray-900">{formatShares(info.shareIssuance.authorizedShares)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 mb-0.5">発行済株式総数</div>
            <div className="text-sm font-bold text-gray-900">{formatShares(info.shareIssuance.issuedShares)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 mb-0.5">自己株式数</div>
            <div className="text-sm font-bold text-gray-900">{formatShares(info.shareIssuance.treasuryShares)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 mb-0.5">流通株式数</div>
            <div className="text-sm font-bold text-gray-900">{formatShares(info.shareIssuance.outstandingShares)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 mb-0.5">単元株式数</div>
            <div className="text-sm font-bold text-gray-900">{info.shareIssuance.unitShares}株</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 mb-0.5">上場日</div>
            <div className="text-sm font-bold text-gray-900">{info.shareIssuance.listingDate}</div>
          </div>
        </div>
      </SectionCard>

      {/* 株主構成（円グラフ）& 株主構成（表） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="株主構成（円グラフ）">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} ${value}%`}>
                  {byType.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="株主構成（表）">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-1.5 font-medium">区分</th>
                  <th className="text-right py-1.5 font-medium">保有比率</th>
                </tr>
              </thead>
              <tbody>
                {byType.sort((a, b) => b.value - a.value).map((t, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: t.fill }} />
                      <span className="text-gray-900">{t.name}</span>
                    </td>
                    <td className="py-1.5 text-right font-medium text-gray-900">{t.value.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* 大株主状況 & 大量保有 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="大株主状況">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-1.5 font-medium">#</th>
                  <th className="text-left py-1.5 font-medium">株主名</th>
                  <th className="text-right py-1.5 font-medium">保有比率</th>
                  <th className="text-right py-1.5 font-medium">保有株数</th>
                </tr>
              </thead>
              <tbody>
                {shareholders.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-400">{i + 1}</td>
                    <td className="py-1.5 text-gray-900">{s.name}</td>
                    <td className="py-1.5 text-right font-medium text-gray-900">{s.percentage.toFixed(1)}%</td>
                    <td className="py-1.5 text-right text-gray-600">{(s.shares * 1000).toLocaleString()}株</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="大量保有">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-1.5 font-medium">報告者</th>
                  <th className="text-right py-1.5 font-medium">保有割合</th>
                  <th className="text-center py-1.5 font-medium">変動</th>
                  <th className="text-right py-1.5 font-medium">報告日</th>
                </tr>
              </thead>
              <tbody>
                {info.largeHoldings.map((h, i) => {
                  const ct = changeTypeLabels[h.changeType];
                  return (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-900">{h.holderName}</td>
                      <td className="py-1.5 text-right font-medium text-gray-900">{h.holdingRatio.toFixed(2)}%</td>
                      <td className="py-1.5 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${ct.color}`}>{ct.text}</span>
                      </td>
                      <td className="py-1.5 text-right text-gray-500">{h.reportDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* 大量保有（被保有） & 自社株買い */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="大量保有(被保有)">
          {info.largeHoldingTargets.length === 0 ? (
            <p className="text-xs text-gray-400">該当なし</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="text-left py-1.5 font-medium">保有先</th>
                    <th className="text-right py-1.5 font-medium">保有割合</th>
                    <th className="text-right py-1.5 font-medium">帳簿価額</th>
                  </tr>
                </thead>
                <tbody>
                  {info.largeHoldingTargets.map((t, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-900">
                        {t.targetName}
                        {t.targetCode && <span className="ml-1 text-[10px] text-gray-400">({t.targetCode})</span>}
                      </td>
                      <td className="py-1.5 text-right font-medium text-gray-900">{t.holdingRatio.toFixed(2)}%</td>
                      <td className="py-1.5 text-right text-gray-700">{formatMillion(t.bookValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="自社株買い">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-1.5 font-medium">期</th>
                  <th className="text-right py-1.5 font-medium">取得株数</th>
                  <th className="text-right py-1.5 font-medium">取得金額</th>
                  <th className="text-right py-1.5 font-medium">消却株数</th>
                </tr>
              </thead>
              <tbody>
                {info.shareBuybacks.map((b, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-700">{b.period}</td>
                    <td className="py-1.5 text-right text-gray-900">{b.sharesAcquired.toLocaleString()}千株</td>
                    <td className="py-1.5 text-right text-gray-900 font-medium">{formatMillion(b.acquisitionAmount)}</td>
                    <td className="py-1.5 text-right text-gray-700">{b.sharesRetired.toLocaleString()}千株</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* 株券貸付関連資料 */}
      <SectionCard title="株券貸付関連資料">
        {info.stockLendings.length === 0 ? (
          <p className="text-xs text-gray-400">該当なし</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-1.5 font-medium">貸出先</th>
                  <th className="text-right py-1.5 font-medium">貸出株数</th>
                  <th className="text-right py-1.5 font-medium">貸出料率</th>
                  <th className="text-right py-1.5 font-medium">開始日</th>
                  <th className="text-right py-1.5 font-medium">終了日</th>
                </tr>
              </thead>
              <tbody>
                {info.stockLendings.map((l, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-900">{l.lender}</td>
                    <td className="py-1.5 text-right text-gray-700">{l.sharesLent.toLocaleString()}千株</td>
                    <td className="py-1.5 text-right text-gray-700">{l.lendingFee}%</td>
                    <td className="py-1.5 text-right text-gray-500">{l.startDate}</td>
                    <td className="py-1.5 text-right text-gray-500">{l.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ============================================
// 関係会社・投資先タブ
// ============================================

function SubsidiariesTab({ info }: { info: CompanyInfoData }) {
  const grouped = useMemo(() => ({
    関係会社: info.subsidiaries.filter(s => s.relationship === 'subsidiary' || s.relationship === 'affiliate'),
    投資先: info.subsidiaries.filter(s => s.relationship === 'investment'),
  }), [info.subsidiaries]);

  const partnersByType = useMemo(() => ({
    仕入先: info.businessPartners.filter(p => p.type === 'supplier'),
    販売先: info.businessPartners.filter(p => p.type === 'sales'),
    その他: info.businessPartners.filter(p => p.type === 'other'),
  }), [info.businessPartners]);

  return (
    <div className="space-y-4">
      {/* 主要な顧客 */}
      <SectionCard title="主要な顧客">
        {info.majorCustomers.length === 0 ? (
          <p className="text-xs text-gray-400">開示情報なし</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-1.5 font-medium">顧客名</th>
                  <th className="text-right py-1.5 font-medium">売上高</th>
                  <th className="text-right py-1.5 font-medium">売上構成比</th>
                  <th className="text-left py-1.5 font-medium">関連セグメント</th>
                </tr>
              </thead>
              <tbody>
                {info.majorCustomers.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-900 font-medium">{c.name}</td>
                    <td className="py-1.5 text-right text-gray-700">{formatMillion(c.salesAmount)}</td>
                    <td className="py-1.5 text-right font-medium text-gray-900">{c.salesRatio}%</td>
                    <td className="py-1.5 text-gray-600">{c.segment || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* 取引先 & 関係会社 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="取引先">
          {Object.entries(partnersByType).map(([label, partners]) => partners.length > 0 && (
            <div key={label} className="mb-3 last:mb-0">
              <div className="text-[10px] text-gray-500 font-semibold mb-1">{label}</div>
              <table className="w-full text-xs">
                <tbody>
                  {partners.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1 text-gray-900">{p.name}</td>
                      <td className="py-1 text-right text-gray-700">{formatMillion(p.transactionAmount)}</td>
                      <td className="py-1 text-right text-gray-500 text-[10px]">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="関係会社">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-1.5 font-medium">会社名</th>
                  <th className="text-right py-1.5 font-medium">議決権</th>
                  <th className="text-center py-1.5 font-medium">連結</th>
                </tr>
              </thead>
              <tbody>
                {grouped.関係会社.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-900">
                      {s.name}
                      <div className="text-[10px] text-gray-400">{s.location} / {s.business}</div>
                    </td>
                    <td className="py-1.5 text-right text-gray-700">{s.ownershipPct}%</td>
                    <td className="py-1.5 text-center">
                      {s.isConsolidated
                        ? <span className="text-green-600 text-[10px] bg-green-50 px-1.5 py-0.5 rounded">連結</span>
                        : <span className="text-gray-400 text-[10px]">持分法</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* 投資先 & 投資額 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="投資先">
          {grouped.投資先.length === 0 ? (
            <div className="text-xs text-gray-400">開示情報なし</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="text-left py-1.5 font-medium">会社名</th>
                    <th className="text-right py-1.5 font-medium">議決権</th>
                    <th className="text-left py-1.5 font-medium">事業内容</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.投資先.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-900 font-medium">{s.name}</td>
                      <td className="py-1.5 text-right text-gray-700">{s.ownershipPct}%</td>
                      <td className="py-1.5 text-gray-600">{s.business}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="投資額">
          {info.largeHoldingTargets.length === 0 ? (
            <div className="text-xs text-gray-400">開示情報なし</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="text-left py-1.5 font-medium">投資先</th>
                    <th className="text-right py-1.5 font-medium">保有割合</th>
                    <th className="text-right py-1.5 font-medium">帳簿価額</th>
                  </tr>
                </thead>
                <tbody>
                  {info.largeHoldingTargets.map((t, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-900">{t.targetName}</td>
                      <td className="py-1.5 text-right text-gray-700">{t.holdingRatio.toFixed(2)}%</td>
                      <td className="py-1.5 text-right font-medium text-gray-900">{formatMillion(t.bookValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ============================================
// 配当/株主還元タブ
// ============================================

function ReturnsTab({ info, dividends }: { info: CompanyInfoData; dividends: DividendData[] }) {
  return (
    <div className="space-y-4">
      {/* 配当 */}
      <SectionCard title="配当" className="bg-amber-50/30 border-amber-200/50">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dividends.slice(-10)} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fiscalYear" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} unit="%" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="left" dataKey="dividendPerShare" name="1株配当(円)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="payoutRatio" name="配当性向(%)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-1.5 font-medium">期</th>
                <th className="text-right py-1.5 font-medium">1株配当</th>
                <th className="text-right py-1.5 font-medium">配当性向</th>
                <th className="text-right py-1.5 font-medium">配当利回り</th>
              </tr>
            </thead>
            <tbody>
              {dividends.slice(-10).map((d, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-700">{d.fiscalYear}</td>
                  <td className="py-1.5 text-right font-medium text-gray-900">{d.dividendPerShare.toFixed(1)}円</td>
                  <td className="py-1.5 text-right text-gray-700">{d.payoutRatio.toFixed(1)}%</td>
                  <td className="py-1.5 text-right text-gray-700">{d.dividendYield.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 株主優待 */}
      <SectionCard title="株主優待">
        {info.shareholderBenefits.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-gray-400">株主優待制度はありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {info.shareholderBenefits.map((b, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">権利確定月: {b.rightsMonth}</span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded">必要株数: {b.minimumShares}株〜</span>
                </div>
                <p className="text-sm text-gray-900 font-medium mb-1">{b.benefitDescription}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>概算金額: {b.estimatedValue.toLocaleString()}円</span>
                  {b.notes && <span>{b.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 株主還元の推移 */}
      <SectionCard title="株主還元の推移">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-1.5 font-medium">期</th>
                <th className="text-right py-1.5 font-medium">1株配当</th>
                <th className="text-right py-1.5 font-medium">配当性向</th>
                <th className="text-right py-1.5 font-medium">自社株買い</th>
                <th className="text-right py-1.5 font-medium">総還元額</th>
                <th className="text-right py-1.5 font-medium">総還元性向</th>
              </tr>
            </thead>
            <tbody>
              {info.shareholderReturns.slice(-10).map((r, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-700">{r.fiscalYear}</td>
                  <td className="py-1.5 text-right text-gray-900 font-medium">{r.dividendPerShare.toFixed(0)}円</td>
                  <td className="py-1.5 text-right text-gray-700">{r.payoutRatio.toFixed(1)}%</td>
                  <td className="py-1.5 text-right text-gray-700">{formatMillion(r.buybackAmount)}</td>
                  <td className="py-1.5 text-right text-gray-900 font-medium">{formatMillion(r.totalReturnAmount)}</td>
                  <td className="py-1.5 text-right">
                    <span className={r.totalReturnRatio >= 50 ? 'text-green-600 font-medium' : 'text-gray-700'}>
                      {r.totalReturnRatio.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 提供していない株主還元系指標 */}
      <SectionCard title="提供していない株主還元系指標">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            const latestReturn = info.shareholderReturns[info.shareholderReturns.length - 1];
            const latestDiv = dividends[dividends.length - 1];
            if (!latestReturn || !latestDiv) return null;
            return (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-[10px] text-gray-400 mb-1">総還元性向（直近）</div>
                  <div className={`text-lg font-bold ${latestReturn.totalReturnRatio >= 50 ? 'text-green-600' : 'text-gray-900'}`}>
                    {latestReturn.totalReturnRatio.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">= (配当+自社株買い) / 純利益</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-[10px] text-gray-400 mb-1">DOE（株主資本配当率）</div>
                  <div className="text-lg font-bold text-gray-900">
                    {(latestDiv.dividendYield * latestDiv.payoutRatio / 100 * 3).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">= 配当性向 × ROE</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-[10px] text-gray-400 mb-1">配当成長率（5年CAGR）</div>
                  <div className="text-lg font-bold text-gray-900">
                    {(() => {
                      const d5ago = dividends[Math.max(0, dividends.length - 6)];
                      if (!d5ago || d5ago.dividendPerShare <= 0) return '-';
                      const cagr = (Math.pow(latestDiv.dividendPerShare / d5ago.dividendPerShare, 1 / 5) - 1) * 100;
                      return `${cagr.toFixed(1)}%`;
                    })()}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">= (最新DPS/5年前DPS)^(1/5) - 1</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-[10px] text-gray-400 mb-1">連続増配年数</div>
                  <div className="text-lg font-bold text-gray-900">
                    {(() => {
                      let count = 0;
                      for (let i = dividends.length - 1; i > 0; i--) {
                        if (dividends[i].dividendPerShare > dividends[i - 1].dividendPerShare) count++;
                        else break;
                      }
                      return `${count}年`;
                    })()}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">前年比でDPSが増加した連続年数</div>
                </div>
              </>
            );
          })()}
        </div>
      </SectionCard>
    </div>
  );
}

// ============================================
// サブコンポーネント
// ============================================

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-50">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function DirectorsTable({ directors }: { directors: Director[] }) {
  const navigate = useNavigate();

  return (
    <SectionCard title="役員の状況">
      <div className="overflow-x-auto">
        <table className="w-full text-xs table-fixed">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left py-1.5 font-medium w-[14%]">氏名</th>
              <th className="text-left py-1.5 font-medium">役職</th>
              <th className="text-right py-1.5 font-medium w-[8%]">年齢</th>
              <th className="text-right py-1.5 font-medium w-[8%]">在任</th>
              <th className="text-right py-1.5 font-medium w-[16%]">保有株式数</th>
              <th className="text-right py-1.5 font-medium w-[14%]">評価額</th>
            </tr>
          </thead>
          <tbody>
            {directors.map((d, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/director/${encodeURIComponent(d.name)}`, { state: { director: d, directorIndex: i } })}
              >
                <td className="py-1.5 text-blue-600 hover:underline font-medium">{d.name}</td>
                <td className="py-1.5 text-gray-600 truncate">
                  {d.position}
                  {d.isOutside && <span className="ml-1 text-[10px] bg-blue-50 text-blue-600 px-1 rounded">社外</span>}
                </td>
                <td className="py-1.5 text-right text-gray-700">{d.age}歳</td>
                <td className="py-1.5 text-right text-gray-700">{d.tenure}</td>
                <td className="py-1.5 text-right text-gray-700">{d.shares.toLocaleString()}株</td>
                <td className="py-1.5 text-right text-gray-700">{d.sharesValue.toLocaleString()}万円</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function DirectorCompensationTable({ data }: { data: CompanyInfoData['directorCompensation'] }) {
  const latestYear = data.length > 0 ? data[data.length - 1].fiscalYear : '';
  const latestData = data.filter(d => d.fiscalYear === latestYear);

  return (
    <div className="overflow-x-auto">
      <div className="text-[10px] text-gray-400 mb-2">{latestYear}（百万円）</div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="text-left py-1.5 font-medium">区分</th>
            <th className="text-right py-1.5 font-medium">員数</th>
            <th className="text-right py-1.5 font-medium">固定</th>
            <th className="text-right py-1.5 font-medium">業績</th>
            <th className="text-right py-1.5 font-medium">株式</th>
            <th className="text-right py-1.5 font-medium font-bold">合計</th>
          </tr>
        </thead>
        <tbody>
          {latestData.map((d, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1.5 text-gray-900">{d.category}</td>
              <td className="py-1.5 text-right text-gray-700">{d.headcount}名</td>
              <td className="py-1.5 text-right text-gray-700">{d.fixedComp}</td>
              <td className="py-1.5 text-right text-gray-700">{d.performanceComp}</td>
              <td className="py-1.5 text-right text-gray-700">{d.stockComp}</td>
              <td className="py-1.5 text-right font-bold text-gray-900">{d.totalComp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditFeeChart({ data }: { data: CompanyInfoData['auditFees'] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fiscalYear" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip formatter={(v) => `${v}百万円`} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="auditFee" name="監査報酬" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="nonAuditFee" name="非監査報酬" fill="#93c5fd" stackId="a" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmployeeTrendChart({ data }: { data: CompanyInfoData['employeeTrends'] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fiscalYear" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip formatter={(v) => `${Number(v).toLocaleString()}人`} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="employeeCount" name="正社員" fill="#3b82f6" stackId="a" />
          <Bar dataKey="tempCount" name="臨時" fill="#93c5fd" stackId="a" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SalaryTrendChart({ data }: { data: CompanyInfoData['salaryTrends'] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="fiscalYear" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9ca3af' }} domain={['auto', 'auto']} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} domain={['auto', 'auto']} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Line yAxisId="left" type="monotone" dataKey="averageSalary" name="平均年収(万円)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="averageAge" name="平均年齢(歳)" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DebtRepaymentTable({ data }: { data: CompanyInfoData['debtRepayment'] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="text-left py-1.5 font-medium">区分</th>
            <th className="text-right py-1.5 font-medium">1年内</th>
            <th className="text-right py-1.5 font-medium">2年</th>
            <th className="text-right py-1.5 font-medium">3年</th>
            <th className="text-right py-1.5 font-medium">4年</th>
            <th className="text-right py-1.5 font-medium">5年</th>
            <th className="text-right py-1.5 font-medium">5年超</th>
            <th className="text-right py-1.5 font-medium font-bold">合計</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1.5 text-gray-900">{d.category}</td>
              <td className="py-1.5 text-right text-gray-700">{formatMillion(d.within1Year)}</td>
              <td className="py-1.5 text-right text-gray-700">{formatMillion(d.within2Years)}</td>
              <td className="py-1.5 text-right text-gray-700">{formatMillion(d.within3Years)}</td>
              <td className="py-1.5 text-right text-gray-700">{formatMillion(d.within4Years)}</td>
              <td className="py-1.5 text-right text-gray-700">{formatMillion(d.within5Years)}</td>
              <td className="py-1.5 text-right text-gray-700">{formatMillion(d.over5Years)}</td>
              <td className="py-1.5 text-right font-bold text-gray-900">{formatMillion(d.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssetLiabilityTable({ data }: { data: CompanyInfoData['assetLiabilityBreakdown'] }) {
  const assets = data.filter(d => d.category === 'asset');
  const liabilities = data.filter(d => d.category === 'liability');

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] text-blue-600 font-semibold mb-1">主な資産</div>
        <table className="w-full text-xs">
          <tbody>
            {assets.map((a, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-1 text-gray-700">{a.label}</td>
                <td className="py-1 text-right text-gray-900 font-medium">{formatMillion(a.amount)}</td>
                <td className="py-1 text-right text-gray-500 w-16">{a.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <div className="text-[10px] text-red-600 font-semibold mb-1">主な負債</div>
        <table className="w-full text-xs">
          <tbody>
            {liabilities.map((l, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-1 text-gray-700">{l.label}</td>
                <td className="py-1 text-right text-gray-900 font-medium">{formatMillion(l.amount)}</td>
                <td className="py-1 text-right text-gray-500 w-16">{l.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
