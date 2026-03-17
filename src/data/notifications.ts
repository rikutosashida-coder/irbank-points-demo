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
  { id: 'n1', type: 'welcome', title: 'Welcomeメッセージ', body: 'IRBANKへようこそ！創業メンバーとして一緒に未来を創りましょう。', date: '2026-04-20', isRead: false },
  { id: 'n2', type: 'badge', title: '賞状を授与されました', body: '「創業参加功労賞」を授与されました！IRBANKのクラウドファンディングに参加した創業メンバーへ贈られる賞状です。', date: '2026-04-19', isRead: false },
  { id: 'n3', type: 'tier', title: '役職昇進のお知らせ', body: 'おめでとうございます！あなたの貢献により「係長」に昇進しました。引き続きIRBANKの成長にご協力ください。', date: '2026-04-18', isRead: true },
  { id: 'n4', type: 'system', title: 'β版機能リリース', body: '新しいポートフォリオ分析機能がリリースされました。マイページからお試しください。', date: '2026-04-17', isRead: true },
  { id: 'n5', type: 'referral', title: '紹介特典獲得', body: 'お友達の登録により500ポイントを獲得しました！さらに紹介してポイントを貯めましょう。', date: '2026-04-16', isRead: true },
  { id: 'n6', type: 'season', title: 'シーズン開始', body: '2026年第2四半期シーズンが開始しました。今シーズンも頑張りましょう！', date: '2026-04-15', isRead: true },
  { id: 'n7', type: 'system', title: 'メンテナンス完了', body: 'システムメンテナンスが完了しました。ご協力ありがとうございました。', date: '2026-04-14', isRead: true },
  { id: 'n8', type: 'badge', title: 'バッジ獲得', body: '「アーリーアダプター」バッジを獲得しました！β版参加者限定のバッジです。', date: '2026-04-13', isRead: true },
];

export const TYPE_COLOR: Record<NotificationItem['type'], string> = {
  badge: 'bg-amber-50 border-amber-200',
  tier: 'bg-blue-50 border-blue-200',
  referral: 'bg-emerald-50 border-emerald-200',
  season: 'bg-violet-50 border-violet-200',
  system: 'bg-gray-50 border-gray-200',
  welcome: 'bg-blue-50 border-blue-200',
};
