import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createWeightSlice, type WeightSlice } from './weightSlice';
import { createNutritionSlice, type NutritionSlice } from './nutritionSlice';
import { createGoalsSlice, type GoalsSlice } from './goalsSlice';
import { createStreakSlice, type StreakSlice } from './streakSlice';
import { createSettingsSlice, type SettingsSlice } from './settingsSlice';

export type AppStore = WeightSlice & NutritionSlice & GoalsSlice & StreakSlice & SettingsSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createWeightSlice(...a),
      ...createNutritionSlice(...a),
      ...createGoalsSlice(...a),
      ...createStreakSlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: 'fat_tracker_v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState, _version) => persistedState as AppStore,
    }
  )
);

// Convenience selectors
export const useWeights = () => useAppStore((s) => s.weights);
export const useMeals = () => useAppStore((s) => s.meals);
export const useGoals = () => useAppStore((s) => s.goals);
export const useMilestones = () => useAppStore((s) => s.milestones);
export const useStreaks = () => useAppStore((s) => s.streaks);
export const useSettings = () => useAppStore((s) => s.settings);
