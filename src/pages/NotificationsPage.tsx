import { useState } from 'react';
import { FiBell, FiArrowLeft, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { MOCK_NOTIFICATIONS, TYPE_COLOR, NotificationItem } from '../data/notifications';

export function NotificationsPage() {
  const navigate = useNavigate();
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.type === 'welcome') {
      navigate('/old-irbank');
    } else if (notification.type === 'pdf' && notification.pdfUrl) {
      window.open(notification.pdfUrl, '_blank');
    } else {
      setSelectedNotification(notification);
    }
  };

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
                <h1 className="text-xl font-bold text-gray-800">すべてのお知らせ</h1>
              </div>
            </div>
          </div>
        </div>

        {/* お知らせ一覧 */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {MOCK_NOTIFICATIONS.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-start gap-4"
              >
                <div className="flex-shrink-0 mt-1.5">
                  {notification.isRead ? (
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold mb-1 ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </div>
                  <div className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {notification.body}
                  </div>
                  <div className="text-xs text-gray-400">{notification.date}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* お知らせ詳細モーダル */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 border ${TYPE_COLOR[selectedNotification.type]}`}>
                  {selectedNotification.type === 'badge' && '賞状'}
                  {selectedNotification.type === 'tier' && '役職'}
                  {selectedNotification.type === 'referral' && '紹介'}
                  {selectedNotification.type === 'season' && 'シーズン'}
                  {selectedNotification.type === 'system' && 'システム'}
                  {selectedNotification.type === 'welcome' && 'ようこそ'}
                  {selectedNotification.type === 'pdf' && 'お知らせ'}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedNotification.title}
                </h3>
                <p className="text-sm text-gray-500">{selectedNotification.date}</p>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedNotification.body}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
  );
}
