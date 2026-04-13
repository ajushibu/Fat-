import type { StateCreator } from 'zustand';
import type { GoalConfig, MilestoneRecord } from '../types';

const DEFAULT_GOALS: GoalConfig = {
  targetWeight: null,
  startWeight: null,
  startDate: null,
  targetDate: null,
  weeklyWeightLossTarget: 0.5,
  dailyCalorieTarget: null,
  dailyProteinTarget: null,
  dailyCarbTarget: null,
  dailyFatTarget: null,
  updatedAt: new Date().toISOString(),
};

export interface GoalsSlice {
  goals: GoalConfig;
  milestones: MilestoneRecord[];
  updateGoals: (updates: Partial<GoalConfig>) => void;
  addMilestone: (m: Omit<MilestoneRecord, 'id'>) => void;
  acknowledgeMilestone: (id: string) => void;
  getGoalProgress: (currentWeight: number | null) => number;
}

export const createGoalsSlice: StateCreator<GoalsSlice> = (set, get) => ({
  goals: DEFAULT_GOALS,
  milestones: [],

  updateGoals: (updates) => {
    set((state) => ({
      goals: { ...state.goals, ...updates, updatedAt: new Date().toISOString() },
    }));
  },

  addMilestone: (m) => {
    const newMilestone: MilestoneRecord = { ...m, id: crypto.randomUUID() };
    set((state) => ({ milestones: [...state.milestones, newMilestone] }));
  },

  acknowledgeMilestone: (id) => {
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === id ? { ...m, acknowledged: true } : m
      ),
    }));
  },

  getGoalProgress: (currentWeight) => {
    const { goals } = get();
    if (!goals.startWeight || !goals.targetWeight || currentWeight === null) return 0;
    const total = goals.startWeight - goals.targetWeight;
    if (total === 0) return 100;
    const done = goals.startWeight - currentWeight;
    return Math.max(0, Math.min(100, (done / total) * 100));
  },
});
