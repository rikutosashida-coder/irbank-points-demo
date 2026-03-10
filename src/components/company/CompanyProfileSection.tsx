import { memo } from 'react';
import { FiCalendar, FiUsers, FiMapPin, FiUser, FiGlobe, FiClock } from 'react-icons/fi';
import { CompanyProfile } from '../../features/company/types/financials.types';

interface CompanyProfileSectionProps {
  profile: CompanyProfile;
}

export const CompanyProfileSection = memo(function CompanyProfileSection({ profile }: CompanyProfileSectionProps) {
  const items = [
    { icon: <FiCalendar className="w-4 h-4" />, label: '設立', value: profile.founded },
    { icon: <FiUsers className="w-4 h-4" />, label: '従業員数', value: `${profile.employees.toLocaleString()}人` },
    { icon: <FiUser className="w-4 h-4" />, label: '平均年収', value: `${profile.averageSalary.toLocaleString()}万円` },
    { icon: <FiMapPin className="w-4 h-4" />, label: '本社', value: profile.headquarters },
    { icon: <FiUser className="w-4 h-4" />, label: '代表', value: profile.ceo },
    { icon: <FiClock className="w-4 h-4" />, label: '決算月', value: profile.fiscalYearEnd },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">企業概要</h2>

      {/* Description */}
      <p className="text-sm text-gray-700 leading-relaxed mb-5">
        {profile.description}
      </p>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2.5">
            <div className="mt-0.5 text-gray-400">{item.icon}</div>
            <div>
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="text-sm font-medium text-gray-900">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* URL */}
      {profile.url && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <FiGlobe className="w-4 h-4 text-gray-400" />
          <a
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline truncate"
          >
            {profile.url}
          </a>
        </div>
      )}
    </div>
  );
});
