import { useMemo } from 'react';
import { useMeals, useGoals } from '../store';
import { last7Days } from '../utils/dateUtils';

export function useNutritionAnalytics(date: string) {
  const meals = useMeals();
  const goals = useGoals();

  return useMemo(() => {
    const dayMeals = meals.filter((m) => m.date === date);
    const totals = dayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const calorieDelta = goals.dailyCalorieTarget
      ? totals.calories - goals.dailyCalorieTarget
      : null;

    // Last 7 days for bar chart
    const weekDays = last7Days();
    const weeklyCalories = weekDays.map((d) => {
      const dayTotal = meals
        .filter((m) => m.date === d)
        .reduce((s, m) => s + m.calories, 0);
      return {
        date: d,
        calories: dayTotal,
        target: goals.dailyCalorieTarget ?? undefined,
        delta: goals.dailyCalorieTarget ? dayTotal - goals.dailyCalorieTarget : undefined,
      };
    });

    const macroKcal = {
      protein: Math.round(totals.protein * 4),
      carbs: Math.round(totals.carbs * 4),
      fat: Math.round(totals.fat * 9),
    };

    return { dayMeals, totals, calorieDelta, weeklyCalories, macroKcal, goals };
  }, [meals, goals, date]);
}
