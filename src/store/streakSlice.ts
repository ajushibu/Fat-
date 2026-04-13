import type { StateCreator } from 'zustand';
import type { StreakData, WeeklyHabitScore } from '../types';

const DEFAULT_STREAKS: StreakData = {
  currentWeighInStreak: 0,
  longestWeighInStreak: 0,
  lastWeighInDate: null,
  currentLogStreak: 0,
  longestLogStreak: 0,
  lastLogDate: null,
  weeklyHabitScores: [],
};

export interface StreakSlice {
  streaks: StreakData;
  updateStreaks: (updates: Partial<StreakData>) => void;
  addHabitScore: (score: WeeklyHabitScore) => void;
}

export const createStreakSlice: StateCreator<StreakSlice> = (set) => ({
  streaks: DEFAULT_STREAKS,

  updateStreaks: (updates) => {
    set((state) => ({ streaks: { ...state.streaks, ...updates } }));
  },

  addHabitScore: (score) => {
    set((state) => {
      const existing = state.streaks.weeklyHabitScores.findIndex(
        (s) => s.weekStart === score.weekStart
      );
      const updated =
        existing >= 0
          ? state.streaks.weeklyHabitScores.map((s, i) => (i === existing ? score : s))
          : [...state.streaks.weeklyHabitScores, score];
      return { streaks: { ...state.streaks, weeklyHabitScores: updated } };
    });
  },
});
