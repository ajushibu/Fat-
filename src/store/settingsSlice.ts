import type { StateCreator } from 'zustand';
import type { UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  weightUnit: 'lbs',
  dateFormat: 'MM/DD/YYYY',
  movingAverageDays: 7,
  showBMI: true,
  calorieDisplayMode: 'deficit_surplus',
  height: null,
};

export interface SettingsSlice {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (updates) => {
    set((state) => ({ settings: { ...state.settings, ...updates } }));
  },
});
