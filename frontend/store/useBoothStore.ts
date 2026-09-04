import { create } from 'zustand';

export type IndustryType = 'BFSI' | 'Manufacturing' | 'Healthcare' | 'Security' | null;

interface BoothState {
  selectedIndustry: IndustryType;
  setIndustry: (industry: string) => void;
  resetStore: () => void;
}

export const useBoothStore = create<BoothState>((set) => ({
  selectedIndustry: null,
  setIndustry: (industry) => set({ selectedIndustry: industry as IndustryType }),
  resetStore: () => set({ selectedIndustry: null }),
}));
