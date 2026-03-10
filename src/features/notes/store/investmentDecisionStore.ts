import { create } from 'zustand';
import { InvestmentDecision } from '../types/investment.types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../services/storage/indexedDB';

interface InvestmentDecisionStore {
  decisions: InvestmentDecision[];
  isLoaded: boolean;

  // データ読み込み
  loadDecisions: () => Promise<void>;

  // CRUD操作
  addDecision: (decision: Omit<InvestmentDecision, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDecision: (id: string, updates: Partial<InvestmentDecision>) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;
  getDecisionsByNoteId: (noteId: string) => InvestmentDecision[];
  getDecisionById: (id: string) => InvestmentDecision | undefined;
}

export const useInvestmentDecisionStore = create<InvestmentDecisionStore>((set, get) => ({
  decisions: [],
  isLoaded: false,

  // IndexedDBから投資判断を読み込み
  loadDecisions: async () => {
    try {
      const decisions = await db.decisions.toArray();
      set({ decisions, isLoaded: true });
    } catch (error) {
      console.error('投資判断読み込みエラー:', error);
      set({ isLoaded: true });
    }
  },

  // 投資判断を追加
  addDecision: async (decision) => {
    const newDecision: InvestmentDecision = {
      ...decision,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.decisions.add(newDecision);
      set((state) => ({
        decisions: [newDecision, ...state.decisions],
      }));
    } catch (error) {
      console.error('投資判断追加エラー:', error);
      throw error;
    }
  },

  // 投資判断を更新
  updateDecision: async (id, updates) => {
    try {
      await db.decisions.update(id, {
        ...updates,
        updatedAt: new Date(),
      });

      set((state) => ({
        decisions: state.decisions.map((decision) =>
          decision.id === id
            ? { ...decision, ...updates, updatedAt: new Date() }
            : decision
        ),
      }));
    } catch (error) {
      console.error('投資判断更新エラー:', error);
      throw error;
    }
  },

  // 投資判断を削除
  deleteDecision: async (id) => {
    try {
      await db.decisions.delete(id);
      set((state) => ({
        decisions: state.decisions.filter((decision) => decision.id !== id),
      }));
    } catch (error) {
      console.error('投資判断削除エラー:', error);
      throw error;
    }
  },

  // ノートIDで投資判断を取得
  getDecisionsByNoteId: (noteId) => {
    return get().decisions.filter((decision) => decision.noteId === noteId);
  },

  // IDで投資判断を取得
  getDecisionById: (id) => {
    return get().decisions.find((decision) => decision.id === id);
  },
}));
