import { create } from 'zustand';
import { UserSettings, UxMode, SidebarItemKey } from '../types/settings.types';
import { db } from '../../../services/storage/indexedDB';

// 全サイドバー項目（デフォルト順序）
export const ALL_SIDEBAR_ITEMS: SidebarItemKey[] = [
  'top', 'companies', 'screening', 'compare', 'investors',
  'newNote', 'mypage', 'points', 'notes', 'favorites', 'archived',
  'dashboard', 'timeline', 'vocabulary', 'badges', 'notifications',
  'settings',
];

interface UserSettingsStore {
  settings: UserSettings | null;
  isLoaded: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Pick<UserSettings, 'uxMode' | 'sidebarItems'>>) => Promise<void>;
  getUxMode: () => UxMode;
  getSidebarItems: () => SidebarItemKey[];
}

const DEFAULT_SETTINGS: UserSettings = {
  id: 'user-1',
  uxMode: 'beginner',
  sidebarItems: [...ALL_SIDEBAR_ITEMS],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useUserSettingsStore = create<UserSettingsStore>((set, get) => ({
  settings: null,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const allSettings = await db.settings.toArray();
      if (allSettings.length > 0) {
        const loaded = allSettings[0] as UserSettings;
        // マイグレーション: sidebarItems が無い場合はデフォルトを設定
        if (!loaded.sidebarItems) {
          loaded.sidebarItems = [...ALL_SIDEBAR_ITEMS];
        } else {
          // 新しく追加された項目が既存設定に無い場合は末尾（settingsの前）に追加
          const newItems = ALL_SIDEBAR_ITEMS.filter(
            item => item !== 'settings' && !loaded.sidebarItems.includes(item)
          );
          if (newItems.length > 0) {
            const settingsIdx = loaded.sidebarItems.indexOf('settings');
            if (settingsIdx >= 0) {
              loaded.sidebarItems.splice(settingsIdx, 0, ...newItems);
            } else {
              loaded.sidebarItems.push(...newItems);
            }
          }
        }
        set({ settings: loaded, isLoaded: true });
      } else {
        // 初回: デフォルト設定を作成
        await db.settings.add(DEFAULT_SETTINGS);
        set({ settings: { ...DEFAULT_SETTINGS }, isLoaded: true });
      }
    } catch (error) {
      console.error('設定読み込みエラー:', error);
      set({ settings: { ...DEFAULT_SETTINGS }, isLoaded: true });
    }
  },

  updateSettings: async (updates) => {
    const current = get().settings;
    if (!current) return;

    const updated: UserSettings = {
      ...current,
      ...updates,
      updatedAt: new Date(),
    };

    await db.settings.update(current.id, updated as any);
    set({ settings: updated });
  },

  getUxMode: () => {
    return get().settings?.uxMode || 'beginner';
  },

  getSidebarItems: () => {
    return get().settings?.sidebarItems || ALL_SIDEBAR_ITEMS;
  },
}));
