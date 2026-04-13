import type { StateCreator } from 'zustand';
import type { MealEntry, DailyNutrition } from '../types';

export interface NutritionSlice {
  meals: MealEntry[];
  addMeal: (entry: Omit<MealEntry, 'id' | 'createdAt'>) => void;
  updateMeal: (id: string, updates: Partial<MealEntry>) => void;
  deleteMeal: (id: string) => void;
  getMealsForDate: (date: string) => MealEntry[];
  getDailyNutrition: (date: string) => DailyNutrition;
}

export const createNutritionSlice: StateCreator<NutritionSlice> = (set, get) => ({
  meals: [],

  addMeal: (entry) => {
    const now = new Date().toISOString();
    const newMeal: MealEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: now,
    };
    set((state) => ({ meals: [...state.meals, newMeal] }));
  },

  updateMeal: (id, updates) => {
    set((state) => ({
      meals: state.meals.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  deleteMeal: (id) => {
    set((state) => ({ meals: state.meals.filter((m) => m.id !== id) }));
  },

  getMealsForDate: (date) => {
    return get().meals.filter((m) => m.date === date);
  },

  getDailyNutrition: (date) => {
    const meals = get().meals.filter((m) => m.date === date);
    return {
      date,
      totalCalories: meals.reduce((s, m) => s + m.calories, 0),
      totalProtein: meals.reduce((s, m) => s + m.protein, 0),
      totalCarbs: meals.reduce((s, m) => s + m.carbs, 0),
      totalFat: meals.reduce((s, m) => s + m.fat, 0),
      meals,
    };
  },
});
