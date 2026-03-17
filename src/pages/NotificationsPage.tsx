import { useState } from 'react';
import { FiBell, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  type: 'badge' | 'tier' | 'referral' | 'season' | 'system' | 'welcome';
  title: string;
  body: string;
  date: string;
  isRead: boolean;
}

const ALL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'welcome', title: 'Welcomeメッセージ', body: 'IRBANKへようこそ！創業メンバーとして一緒に未来を創りましょう。', date: '2026-04-15', isRead: false },
  { id: 'n2', type: 'badge', title: '賞状を授与されました', body: '「創業参加功労賞」を授与されました！IRBANKのWaiting Listに登録した創業メンバーへ贈られる賞状です。', date: '2026-04-15', isRead: false },
  { id: 'n3', type: 'system', title: 'IRBANKからのお知らせ', body: 'Beta版の先行体験が2026年8月3日より開始されます。群Aの皆様はお楽しみに！', date: '2026-04-10', isRead: true },
  { id: 'n4', type: 'referral', title: '招待した仲間がチュートリアルを完了しました', body: 'UID: UID-00391 さんがチュートリアルを完了しました。招待ポイント +25pt が付与されました。', date: '2026-04-08', isRead: true },
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
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
              <div
                key={n.id}
                className={`px-6 py-4 ${n.isRead ? 'bg-white' : 'bg-blue-50/30'}`}
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
              </div>
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
    </div>
  );
}
