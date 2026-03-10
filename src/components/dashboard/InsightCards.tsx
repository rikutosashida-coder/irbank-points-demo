import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { Insight } from '../../features/dashboard/types/insight.types';

interface InsightCardsProps {
  insights: Insight[];
}

const severityConfig = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    descColor: 'text-amber-800',
    btnBg: 'bg-amber-100 hover:bg-amber-200 text-amber-800',
    Icon: FiAlertTriangle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    descColor: 'text-blue-800',
    btnBg: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
    Icon: FiInfo,
  },
  positive: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    descColor: 'text-green-800',
    btnBg: 'bg-green-100 hover:bg-green-200 text-green-800',
    Icon: FiCheckCircle,
  },
};

export function InsightCards({ insights }: InsightCardsProps) {
  const navigate = useNavigate();

  if (insights.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {insights.map((insight) => {
        const config = severityConfig[insight.severity];
        const { Icon } = config;

        return (
          <div
            key={insight.id}
            className={`flex-shrink-0 w-80 p-4 rounded-lg border ${config.bg} ${config.border}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${config.iconBg}`}>
                <Icon className={`w-4 h-4 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                  {insight.title}
                </h3>
                <p className={`text-xs ${config.descColor} leading-relaxed mb-3`}>
                  {insight.description}
                </p>
                {insight.actionLabel && insight.actionRoute && (
                  <button
                    onClick={() => navigate(insight.actionRoute!)}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${config.btnBg}`}
                  >
                    {insight.actionLabel}
                    <FiArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
