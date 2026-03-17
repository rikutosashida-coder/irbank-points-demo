import { useState } from 'react';
import { FiBell, FiArrowLeft, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { WelcomePopup } from '../components/WelcomePopup';

interface NotificationItem {
  id: string;
  type: 'badge' | 'tier' | 'referral' | 'season' | 'system' | 'welcome';
  title: string;
  body: string;
  detailedBody?: string;
  date: string;
  isRead: boolean;
}

const ALL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'welcome',
    title: 'Welcomeメッセージ',
    body: 'IRBANKへようこそ！創業メンバーとして一緒に未来を創りましょう。',
    detailedBody: 'IRBANKへようこそ！\n\nあなたは創業メンバーとして、新しいIRBANKを一緒に創り上げていく仲間です。\n\nこれから一緒に、ユーザー一体型の投資プラットフォームを育てていきましょう。\n\nあなたの活動はすべてポイントとして評価され、貢献に応じて役職が上がっていきます。\n\nよろしくお願いします！',
    date: '2026-04-15',
    isRead: false
  },
  {
    id: 'n2',
    type: 'badge',
    title: '賞状を授与されました',
    body: '「創業参加功労賞」を授与されました！IRBANKのWaiting Listに登録した創業メンバーへ贈られる賞状です。',
    detailedBody: '「創業参加功労賞」を授与されました！\n\nこの賞状は、IRBANKのWaiting Listに登録した創業メンバーへ贈られる特別な賞状です。\n\n貢献度: +10pt\n\nあなたは新生IRBANKの第二の創業に参加した、貴重な創業メンバーの一人です。\n\nこれからも一緒にIRBANKを育てていきましょう！',
    date: '2026-04-15',
    isRead: false
  },
];

const TYPE_COLOR: Record<NotificationItem['type'], string> = {
  badge: 'bg-amber-50 border-amber-200',
  tier: 'bg-blue-50 border-blue-200',
  referral: 'bg-emerald-50 border-emerald-200',
  season: 'bg-violet-50 border-violet-200',
  system: 'bg-gray-50 border-gray-200',
  welcome: 'bg-blue-50 border-blue-200',
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications] = useState<NotificationItem[]>(ALL_NOTIFICATIONS);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.type === 'welcome') {
      setShowWelcomePopup(true);
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
              <h1 className="text-xl font-bold text-gray-800">お知らせ</h1>
              {unreadCount > 0 && (
                <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* お知らせリスト */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${n.isRead ? 'bg-white' : 'bg-blue-50/30'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {n.isRead ? (
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`text-sm font-semibold ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {n.title}
                      </h3>
                      <span className="flex-shrink-0 text-xs text-gray-400">{n.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {notifications.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">お知らせはありません</p>
          </div>
        )}
      </div>

      {/* Welcomeポップアップ */}
      <WelcomePopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
      />

      {/* 詳細モーダル */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
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
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedNotification.detailedBody || selectedNotification.body}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
