import { create } from 'zustand';
import { CompanyFinancials } from '../types/financials.types';
import { getCompanyFinancials } from '../../../services/api/companyFinancialsApi';

interface PeerCompareStore {
  selectedCodes: string[];
  dataCache: Map<string, CompanyFinancials>;
  loadingCodes: Set<string>;

  addCompany: (code: string) => Promise<void>;
  removeCompany: (code: string) => void;
  clearAll: () => void;
  isInComparison: (code: string) => boolean;
}

export const usePeerCompareStore = create<PeerCompareStore>((set, get) => ({
  selectedCodes: [],
  dataCache: new Map(),
  loadingCodes: new Set(),

  addCompany: async (code: string) => {
    const { selectedCodes, dataCache, loadingCodes } = get();
    if (selectedCodes.includes(code) || loadingCodes.has(code)) return;

    set({ selectedCodes: [...selectedCodes, code] });

    if (!dataCache.has(code)) {
      set({ loadingCodes: new Set(get().loadingCodes).add(code) });
      const data = await getCompanyFinancials(code);
      const next = new Set(get().loadingCodes);
      next.delete(code);
      if (data) {
        const updatedCache = new Map(get().dataCache);
        updatedCache.set(code, data);
        set({ dataCache: updatedCache, loadingCodes: next });
      } else {
        set({ loadingCodes: next });
      }
    }
  },

  removeCompany: (code: string) => {
    set({ selectedCodes: get().selectedCodes.filter(c => c !== code) });
  },

  clearAll: () => {
    set({ selectedCodes: [], dataCache: new Map(), loadingCodes: new Set() });
  },

  isInComparison: (code: string) => {
    return get().selectedCodes.includes(code);
  },
}));
