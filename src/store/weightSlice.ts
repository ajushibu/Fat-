import type { StateCreator } from 'zustand';
import type { WeightEntry } from '../types';

export interface WeightSlice {
  weights: WeightEntry[];
  addWeight: (entry: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWeight: (id: string, updates: Partial<WeightEntry>) => void;
  deleteWeight: (id: string) => void;
  getWeightForDate: (date: string) => WeightEntry | undefined;
}

export const createWeightSlice: StateCreator<WeightSlice> = (set, get) => ({
  weights: [],

  addWeight: (entry) => {
    const now = new Date().toISOString();
    const newEntry: WeightEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      weights: [...state.weights, newEntry].sort((a, b) => a.date.localeCompare(b.date)),
    }));
  },

  updateWeight: (id, updates) => {
    set((state) => ({
      weights: state.weights.map((w) =>
        w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
      ),
    }));
  },

  deleteWeight: (id) => {
    set((state) => ({
      weights: state.weights.filter((w) => w.id !== id),
    }));
  },

  getWeightForDate: (date) => {
    return get().weights.find((w) => w.date === date);
  },
});
