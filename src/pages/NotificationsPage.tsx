import { FiBell, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <FiBell className="w-5 h-5 text-gray-700" />
              <h1 className="text-xl font-bold text-gray-800">通知</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
          <p className="text-gray-500">通知機能は準備中です</p>
        </div>
      </div>
    </div>
  );
}
