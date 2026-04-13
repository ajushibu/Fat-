import { useEffect } from 'react';
import { useAppStore, useWeights, useMeals } from '../store';
import { computeHabitScore } from '../utils/analytics';
import { todayStr, last7Days, weekStartStr } from '../utils/dateUtils';
import { checkMilestones } from '../utils/milestones';
import toast from 'react-hot-toast';

export function useStreakCalc() {
  const weights = useWeights();
  const meals = useMeals();
  const updateStreaks = useAppStore((s) => s.updateStreaks);
  const addHabitScore = useAppStore((s) => s.addHabitScore);
  const addMilestone = useAppStore((s) => s.addMilestone);
  const goals = useAppStore((s) => s.goals);
  const streaks = useAppStore((s) => s.streaks);
  const existingMilestones = useAppStore((s) => s.milestones);

  useEffect(() => {
    const today = todayStr();
    const allDates = new Set([
      ...weights.map((w) => w.date),
      ...meals.map((m) => m.date),
    ]);
    const weighInDates = new Set(weights.map((w) => w.date));

    // Compute current log streak
    let logStreak = 0;
    let d = today;
    while (allDates.has(d)) {
      logStreak++;
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      d = prev.toISOString().split('T')[0];
    }

    // Compute weigh-in streak
    let weighStreak = 0;
    d = today;
    while (weighInDates.has(d)) {
      weighStreak++;
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      d = prev.toISOString().split('T')[0];
    }

    updateStreaks({
      currentLogStreak: logStreak,
      longestLogStreak: Math.max(streaks.longestLogStreak, logStreak),
      lastLogDate: allDates.size > 0 ? [...allDates].sort().reverse()[0] : null,
      currentWeighInStreak: weighStreak,
      longestWeighInStreak: Math.max(streaks.longestWeighInStreak, weighStreak),
      lastWeighInDate: weighInDates.size > 0 ? [...weighInDates].sort().reverse()[0] : null,
    });

    // Weekly habit score
    const week = last7Days();
    const weekWeighDays = week.filter((d) => weighInDates.has(d)).length;
    const weekCalDays = week.filter((d) => {
      if (!goals.dailyCalorieTarget) return false;
      const total = meals.filter((m) => m.date === d).reduce((s, m) => s + m.calories, 0);
      return total > 0 && total <= goals.dailyCalorieTarget;
    }).length;

    const score = computeHabitScore(weekWeighDays, weekCalDays);
    addHabitScore({
      weekStart: weekStartStr(),
      weighInDays: weekWeighDays,
      calorieGoalDays: weekCalDays,
      score,
    });

    // Milestone detection
    const newMilestones = checkMilestones({
      weights,
      meals,
      goals,
      streaks: {
        ...streaks,
        currentWeighInStreak: weighStreak,
        longestWeighInStreak: Math.max(streaks.longestWeighInStreak, weighStreak),
      },
      existingMilestones,
    });

    for (const m of newMilestones) {
      addMilestone(m);
      toast.success(m.label, { duration: 4000, icon: '🏆' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights.length, meals.length]);
}
