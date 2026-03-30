export type UxMode = 'beginner' | 'analyst';

export type AnalysisDepth = 'quick' | 'standard' | 'deep';

// サイドバーに表示可能な項目のキー
export type SidebarItemKey =
  // IRBANK情報
  | 'top' | 'companies' | 'screening' | 'compare' | 'investors' | 'oldIrbank'
  // マイページ
  | 'newNote' | 'mypage' | 'notes' | 'favorites' | 'archived'
  | 'dashboard' | 'timeline' | 'vocabulary' | 'badges' | 'notifications' | 'points'
  // 設定
  | 'settings';

export interface UserSettings {
  id: string; // 常に 'user-1'
  uxMode: UxMode;
  sidebarItems: SidebarItemKey[]; // 表示するサイドバー項目（順序も保持）
  createdAt: Date;
  updatedAt: Date;
}
