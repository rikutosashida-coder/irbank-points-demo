import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiX, FiZap } from 'react-icons/fi';
import { useNextAction } from '../../hooks/useNextAction';

interface NextActionBannerProps {
  context: 'editor' | 'dashboard';
  noteId?: string;
}

export function NextActionBanner({ context, noteId }: NextActionBannerProps) {
  const navigate = useNavigate();
  const nextAction = useNextAction({ context, noteId });
  const [dismissed, setDismissed] = useState(false);

  if (!nextAction || dismissed) return null;

  const handleAction = () => {
    if (nextAction.navigateTo) {
      navigate(nextAction.navigateTo);
    }
    if (nextAction.scrollToId) {
      const element = document.getElementById(nextAction.scrollToId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <FiZap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">{nextAction.message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
          >
            {nextAction.actionLabel}
            <FiArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded transition-colors"
            title="閉じる"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
