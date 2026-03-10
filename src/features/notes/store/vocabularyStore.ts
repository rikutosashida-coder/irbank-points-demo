import { create } from 'zustand';
import { VocabularyEntry, MasteryLevel } from '../types/note.types';
import { db } from '../../../services/storage/indexedDB';

// 間隔反復のインターバル（日数）: masteryLevel → 次回復習までの日数
const REVIEW_INTERVALS: Record<number, number> = {
  0: 0, // 即時
  1: 1, // 1日後
  2: 3, // 3日後
  3: 7, // 1週間後
  4: 14, // 2週間後
  5: 30, // 1ヶ月後
};

interface VocabularyStore {
  entries: VocabularyEntry[];
  isLoaded: boolean;

  // データ読み込み
  loadEntries: () => Promise<void>;

  // CRUD操作
  addEntry: (entry: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<VocabularyEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesByNoteId: (noteId: string) => VocabularyEntry[];
  searchEntries: (query: string) => VocabularyEntry[];

  // 学習操作
  recordReview: (id: string, isCorrect: boolean) => Promise<void>;
  getDueEntries: () => VocabularyEntry[];
}

export const useVocabularyStore = create<VocabularyStore>((set, get) => ({
  entries: [],
  isLoaded: false,

  // IndexedDBから単語帳を読み込み
  loadEntries: async () => {
    try {
      const entries = await db.vocabulary.toArray();
      set({ entries, isLoaded: true });
    } catch (error) {
      console.error('単語帳読み込みエラー:', error);
      set({ isLoaded: true });
    }
  },

  // 単語を追加
  addEntry: async (entry) => {
    const newEntry: VocabularyEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.vocabulary.add(newEntry);
      set((state) => ({
        entries: [...state.entries, newEntry],
      }));
    } catch (error) {
      console.error('単語追加エラー:', error);
      throw error;
    }
  },

  // 単語を更新
  updateEntry: async (id, updates) => {
    try {
      await db.vocabulary.update(id, {
        ...updates,
        updatedAt: new Date(),
      });

      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === id
            ? { ...entry, ...updates, updatedAt: new Date() }
            : entry
        ),
      }));
    } catch (error) {
      console.error('単語更新エラー:', error);
      throw error;
    }
  },

  // 単語を削除
  deleteEntry: async (id) => {
    try {
      await db.vocabulary.delete(id);
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
      }));
    } catch (error) {
      console.error('単語削除エラー:', error);
      throw error;
    }
  },

  // ノートIDで単語を取得
  getEntriesByNoteId: (noteId) => {
    return get().entries.filter((entry) => entry.noteId === noteId);
  },

  // 単語を検索
  searchEntries: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().entries.filter(
      (entry) =>
        entry.word.toLowerCase().includes(lowerQuery) ||
        entry.meaning.toLowerCase().includes(lowerQuery) ||
        entry.context?.toLowerCase().includes(lowerQuery)
    );
  },

  // 復習結果を記録（間隔反復）
  recordReview: async (id, isCorrect) => {
    const entry = get().entries.find(e => e.id === id);
    if (!entry) return;

    const currentMastery = (entry.masteryLevel || 0) as number;
    const newMastery = isCorrect
      ? Math.min(5, currentMastery + 1)
      : Math.max(0, currentMastery - 1);

    const intervalDays = REVIEW_INTERVALS[newMastery] || 1;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);

    const updates: Partial<VocabularyEntry> = {
      masteryLevel: newMastery as MasteryLevel,
      reviewCount: (entry.reviewCount || 0) + 1,
      correctCount: (entry.correctCount || 0) + (isCorrect ? 1 : 0),
      lastReviewedAt: new Date(),
      nextReviewAt: nextReview,
    };

    try {
      await db.vocabulary.update(id, { ...updates, updatedAt: new Date() });
      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
        ),
      }));
    } catch (error) {
      console.error('復習記録エラー:', error);
    }
  },

  // 復習が必要な単語を取得
  getDueEntries: () => {
    const now = new Date();
    return get().entries.filter((entry) => {
      // 未学習の単語は常に対象
      if (entry.masteryLevel == null || entry.masteryLevel === 0) return true;
      // 習得済み(5)で次回復習日がまだ先なら除外
      if (!entry.nextReviewAt) return true;
      return new Date(entry.nextReviewAt) <= now;
    });
  },
}));
