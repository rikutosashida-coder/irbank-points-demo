import { create } from 'zustand';
import { NoteTemplate } from '../types/template.types';
import { db } from '../../../services/storage/indexedDB';
import { DEFAULT_TEMPLATES } from '../../../data/defaultTemplates';
import { v4 as uuidv4 } from 'uuid';

interface TemplateStore {
  templates: NoteTemplate[];
  isLoaded: boolean;

  // アクション
  loadTemplates: () => Promise<void>;
  getTemplateById: (id: string) => NoteTemplate | undefined;
  getTemplatesByCategory: (category: NoteTemplate['category']) => NoteTemplate[];
  createTemplate: (template: Omit<NoteTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<NoteTemplate>;
  updateTemplate: (id: string, updates: Partial<NoteTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  incrementUsageCount: (id: string) => Promise<void>;
  initializeDefaultTemplates: () => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  isLoaded: false,

  // テンプレート読み込み
  loadTemplates: async () => {
    try {
      const templates = await db.templates.toArray();

      // テンプレートが空の場合、デフォルトテンプレートを初期化
      if (templates.length === 0) {
        await get().initializeDefaultTemplates();
        return;
      }

      set({ templates, isLoaded: true });
    } catch (error) {
      console.error('テンプレート読み込みエラー:', error);
      set({ isLoaded: true });
    }
  },

  // ID でテンプレート取得
  getTemplateById: (id: string) => {
    return get().templates.find(t => t.id === id);
  },

  // カテゴリでテンプレート取得
  getTemplatesByCategory: (category) => {
    return get().templates.filter(t => t.category === category);
  },

  // テンプレート作成
  createTemplate: async (templateData) => {
    const newTemplate: NoteTemplate = {
      ...templateData,
      id: uuidv4(),
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.templates.add(newTemplate);
    set(state => ({
      templates: [...state.templates, newTemplate]
    }));

    return newTemplate;
  },

  // テンプレート更新
  updateTemplate: async (id, updates) => {
    await db.templates.update(id, {
      ...updates,
      updatedAt: new Date()
    });

    set(state => ({
      templates: state.templates.map(t =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date() }
          : t
      )
    }));
  },

  // テンプレート削除
  deleteTemplate: async (id) => {
    await db.templates.delete(id);
    set(state => ({
      templates: state.templates.filter(t => t.id !== id)
    }));
  },

  // 使用回数をインクリメント
  incrementUsageCount: async (id) => {
    const template = get().getTemplateById(id);
    if (!template) return;

    const newUsageCount = template.usageCount + 1;
    await db.templates.update(id, { usageCount: newUsageCount });

    set(state => ({
      templates: state.templates.map(t =>
        t.id === id
          ? { ...t, usageCount: newUsageCount }
          : t
      )
    }));
  },

  // デフォルトテンプレート初期化
  initializeDefaultTemplates: async () => {
    try {
      await db.templates.bulkAdd(DEFAULT_TEMPLATES);
      set({ templates: DEFAULT_TEMPLATES, isLoaded: true });
      console.log('デフォルトテンプレートを初期化しました');
    } catch (error) {
      console.error('デフォルトテンプレート初期化エラー:', error);
    }
  },
}));
