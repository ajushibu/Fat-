// ──────────────────────────────────────────────
// Weight Loss Tracker — TypeScript Data Models
// ──────────────────────────────────────────────

export type WeightUnit = 'kg' | 'lbs';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type Theme = 'light' | 'dark' | 'system';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type CalorieDisplay = 'absolute' | 'deficit_surplus';

// ── Weight Entry ─────────────────────────────
export interface WeightEntry {
  id: string;          // crypto.randomUUID()
  date: string;        // "YYYY-MM-DD" — one per day
  weight: number;
  bodyFatPct: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Meal / Nutrition Entry ───────────────────
export interface MealEntry {
  id: string;
  date: string;        // "YYYY-MM-DD"
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;     // grams
  carbs: number;       // grams
  fat: number;         // grams
  fiber: number | null;
  servingSize: string | null;
  createdAt: string;
}

// Derived (computed, not stored)
export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: MealEntry[];
}

// ── Goals ────────────────────────────────────
export interface GoalConfig {
  targetWeight: number | null;
  startWeight: number | null;
  startDate: string | null;
  targetDate: string | null;
  weeklyWeightLossTarget: number;  // default 0.5
  dailyCalorieTarget: number | null;
  dailyProteinTarget: number | null;
  dailyCarbTarget: number | null;
  dailyFatTarget: number | null;
  updatedAt: string;
}

// ── Milestones ───────────────────────────────
export type MilestoneType =
  | 'first_entry'
  | 'weight_lost_1'
  | 'weight_lost_5'
  | 'weight_lost_10'
  | 'weight_lost_25'
  | 'weight_pct_25'
  | 'weight_pct_50'
  | 'weight_pct_75'
  | 'weight_pct_100'
  | 'streak_7'
  | 'streak_30'
  | 'streak_60'
  | 'streak_100'
  | 'calorie_goal_7'
  | 'calorie_goal_30'
  | 'at_goal_weight'
  | 'custom';

export interface MilestoneRecord {
  id: string;
  type: MilestoneType;
  achievedAt: string;
  value: number;
  label: string;
  acknowledged: boolean;
}

// ── Streaks & Accountability ─────────────────
export interface WeeklyHabitScore {
  weekStart: string;        // "YYYY-MM-DD" of Monday
  weighInDays: number;      // 0–7
  calorieGoalDays: number;  // days within target
  score: number;            // 0–100
}

export interface StreakData {
  currentWeighInStreak: number;
  longestWeighInStreak: number;
  lastWeighInDate: string | null;
  currentLogStreak: number;
  longestLogStreak: number;
  lastLogDate: string | null;
  weeklyHabitScores: WeeklyHabitScore[];
}

// ── Settings ─────────────────────────────────
export interface UserSettings {
  theme: Theme;
  weightUnit: WeightUnit;
  dateFormat: DateFormat;
  movingAverageDays: 7 | 14 | 30;
  showBMI: boolean;
  calorieDisplayMode: CalorieDisplay;
  height: number | null;  // cm
}

// ── App Meta ─────────────────────────────────
export interface AppMeta {
  createdAt: string;
  lastModifiedAt: string;
}

// ── Root Storage ─────────────────────────────
export interface AppStorage {
  version: number;
  meta: AppMeta;
  weights: WeightEntry[];
  meals: MealEntry[];
  goals: GoalConfig;
  milestones: MilestoneRecord[];
  streaks: StreakData;
  settings: UserSettings;
}

// ── Analytics helpers (computed) ─────────────
export interface TrendResult {
  slope: number;          // weight change per day
  ratePerWeek: number;
  direction: 'losing' | 'gaining' | 'stable';
}

export interface MovingAvgPoint {
  date: string;
  value: number;
}

export interface ChartDataPoint {
  date: string;
  weight?: number;
  ma7?: number;
  ma30?: number;
  calories?: number;
  projected?: number;
}
