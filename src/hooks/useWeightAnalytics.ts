import { useMemo } from 'react';
import { useWeights, useGoals, useSettings } from '../store';
import {
  movingAverage,
  linearRegression,
  projectGoalDate,
  weekOverWeekDelta,
  buildWeightChartData,
  buildProjectionData,
  calcBMI,
  bmiCategory,
} from '../utils/analytics';

export function useWeightAnalytics() {
  const weights = useWeights();
  const goals = useGoals();
  const settings = useSettings();

  return useMemo(() => {
    const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1] ?? null;
    const ma7 = movingAverage(sorted, 7);
    const ma30 = movingAverage(sorted, 30);
    const trend = linearRegression(sorted);
    const projectedGoalDate = goals.targetWeight
      ? projectGoalDate(sorted, goals.targetWeight)
      : null;
    const delta = weekOverWeekDelta(sorted);
    const chartData = buildWeightChartData(sorted, ma7, ma30, goals.targetWeight);
    const projectionData = buildProjectionData(sorted, goals.targetWeight);

    const bmi =
      latest && settings.height && settings.weightUnit === 'kg'
        ? calcBMI(latest.weight, settings.height)
        : latest && settings.height && settings.weightUnit === 'lbs'
        ? calcBMI(latest.weight * 0.453592, settings.height)
        : null;

    const minWeight = sorted.length > 0 ? Math.min(...sorted.map((e) => e.weight)) : null;
    const maxWeight = sorted.length > 0 ? Math.max(...sorted.map((e) => e.weight)) : null;
    const avgWeight =
      sorted.length > 0
        ? Math.round((sorted.reduce((s, e) => s + e.weight, 0) / sorted.length) * 10) / 10
        : null;

    return {
      sorted,
      latest,
      ma7,
      ma30,
      trend,
      projectedGoalDate,
      weekDelta: delta,
      chartData,
      projectionData,
      bmi,
      bmiCategory: bmi ? bmiCategory(bmi) : null,
      minWeight,
      maxWeight,
      avgWeight,
      totalLost:
        sorted.length > 1
          ? Math.round((sorted[0].weight - sorted[sorted.length - 1].weight) * 10) / 10
          : null,
    };
  }, [weights, goals.targetWeight, settings.height, settings.weightUnit]);
}
