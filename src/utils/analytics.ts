import type { WeightEntry, TrendResult, MovingAvgPoint, ChartDataPoint } from '../types';
import { format, parseISO, addDays } from 'date-fns';

// ── Moving Average ────────────────────────────
export function movingAverage(entries: WeightEntry[], windowDays: number): MovingAvgPoint[] {
  if (entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((entry, idx) => {
    const windowStart = Math.max(0, idx - windowDays + 1);
    const window = sorted.slice(windowStart, idx + 1);
    const avg = window.reduce((s, e) => s + e.weight, 0) / window.length;
    return { date: entry.date, value: Math.round(avg * 10) / 10 };
  });
}

// ── Linear Regression (least squares) ────────
export function linearRegression(entries: WeightEntry[]): TrendResult {
  if (entries.length < 2) return { slope: 0, ratePerWeek: 0, direction: 'stable' };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const n = sorted.length;
  const x0 = parseISO(sorted[0].date).getTime();

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const e of sorted) {
    const x = (parseISO(e.date).getTime() - x0) / 86400000; // days
    sumX += x;
    sumY += e.weight;
    sumXY += x * e.weight;
    sumX2 += x * x;
  }

  const denom = n * sumX2 - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const ratePerWeek = slope * 7;

  return {
    slope,
    ratePerWeek: Math.round(ratePerWeek * 100) / 100,
    direction: Math.abs(ratePerWeek) < 0.05 ? 'stable' : ratePerWeek < 0 ? 'losing' : 'gaining',
  };
}

// ── Project goal date ─────────────────────────
export function projectGoalDate(
  entries: WeightEntry[],
  targetWeight: number
): string | null {
  if (entries.length < 3) return null;
  const trend = linearRegression(entries);
  if (trend.slope >= 0) return null; // not losing

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const daysNeeded = (latest.weight - targetWeight) / Math.abs(trend.slope);
  if (daysNeeded <= 0 || daysNeeded > 3650) return null;

  const goalDate = addDays(parseISO(latest.date), Math.ceil(daysNeeded));
  return format(goalDate, 'yyyy-MM-dd');
}

// ── Build chart data ──────────────────────────
export function buildWeightChartData(
  entries: WeightEntry[],
  ma7: MovingAvgPoint[],
  ma30: MovingAvgPoint[],
  targetWeight?: number | null
): ChartDataPoint[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const ma7Map = new Map(ma7.map((p) => [p.date, p.value]));
  const ma30Map = new Map(ma30.map((p) => [p.date, p.value]));

  return sorted.map((e) => ({
    date: e.date,
    weight: e.weight,
    ma7: ma7Map.get(e.date),
    ma30: ma30Map.get(e.date),
    target: targetWeight ?? undefined,
  }));
}

// ── Projection chart data ─────────────────────
export function buildProjectionData(
  entries: WeightEntry[],
  targetWeight: number | null,
  daysForward = 90
): ChartDataPoint[] {
  if (entries.length < 2) return [];
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const trend = linearRegression(sorted);
  const latest = sorted[sorted.length - 1];

  const historical: ChartDataPoint[] = sorted.map((e) => ({
    date: e.date,
    weight: e.weight,
  }));

  if (trend.slope >= 0 && !targetWeight) return historical;

  const projected: ChartDataPoint[] = [];
  for (let i = 1; i <= daysForward; i++) {
    const date = format(addDays(parseISO(latest.date), i), 'yyyy-MM-dd');
    const projectedWeight = latest.weight + trend.slope * i;
    if (targetWeight && projectedWeight <= targetWeight) {
      projected.push({ date, projected: targetWeight });
      break;
    }
    projected.push({ date, projected: Math.round(projectedWeight * 10) / 10 });
  }

  return [...historical, ...projected];
}

// ── BMI ───────────────────────────────────────
export function calcBMI(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// ── Habit score ───────────────────────────────
export function computeHabitScore(weighInDays: number, calorieGoalDays: number): number {
  const base = (weighInDays / 7) * 50 + (calorieGoalDays / 7) * 50;
  const bonus = (weighInDays === 7 ? 5 : 0) + (calorieGoalDays === 7 ? 5 : 0);
  return Math.min(100, Math.round(base + bonus));
}

// ── Week-over-week delta ──────────────────────
export function weekOverWeekDelta(entries: WeightEntry[]): number | null {
  if (entries.length < 2) return null;
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const recentSlice = sorted.slice(-7);
  const prevSlice = sorted.slice(-14, -7);

  if (recentSlice.length === 0 || prevSlice.length === 0) return null;

  const recentAvg = recentSlice.reduce((s, e) => s + e.weight, 0) / recentSlice.length;
  const prevAvg = prevSlice.reduce((s, e) => s + e.weight, 0) / prevSlice.length;

  return Math.round((recentAvg - prevAvg) * 10) / 10;
}
