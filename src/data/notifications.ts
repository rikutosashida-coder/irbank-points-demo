// ─── お知らせデータ ────────────────────

export interface NotificationItem {
  id: string;
  type: 'badge' | 'tier' | 'referral' | 'season' | 'system' | 'welcome';
  title: string;
  body: string;
  date: string;
  isRead: boolean;
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'welcome', title: 'Welcomeメッセージ', body: 'IRBANKへようこそ！創業メンバーとして一緒に未来を創りましょう。', date: '2026-04-15', isRead: false },
  { id: 'n2', type: 'badge', title: '賞状を授与されました', body: '「創業参加功労賞」を授与されました！IRBANKのクラウドファンディングに参加した創業メンバーへ贈られる賞状です。', date: '2026-04-15', isRead: false },
];

export const TYPE_COLOR: Record<NotificationItem['type'], string> = {
  badge: 'bg-amber-50 border-amber-200',
  tier: 'bg-blue-50 border-blue-200',
  referral: 'bg-emerald-50 border-emerald-200',
  season: 'bg-violet-50 border-violet-200',
  system: 'bg-gray-50 border-gray-200',
  welcome: 'bg-blue-50 border-blue-200',
};
