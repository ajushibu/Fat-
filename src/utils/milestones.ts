import type { WeightEntry, MealEntry, GoalConfig, MilestoneRecord, MilestoneType, StreakData } from '../types';

interface MilestoneCheckInput {
  weights: WeightEntry[];
  meals: MealEntry[];
  goals: GoalConfig;
  streaks: StreakData;
  existingMilestones: MilestoneRecord[];
}

function hasMilestone(existing: MilestoneRecord[], type: MilestoneType): boolean {
  return existing.some((m) => m.type === type);
}

function makeMilestone(
  type: MilestoneType,
  label: string,
  value: number
): Omit<MilestoneRecord, 'id'> {
  return { type, label, value, achievedAt: new Date().toISOString(), acknowledged: false };
}

export function checkMilestones(input: MilestoneCheckInput): Omit<MilestoneRecord, 'id'>[] {
  const { weights, goals, streaks, existingMilestones } = input;
  const newMilestones: Omit<MilestoneRecord, 'id'>[] = [];

  if (weights.length === 0) return newMilestones;

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const firstWeight = sorted[0].weight;
  const latestWeight = sorted[sorted.length - 1].weight;
  const totalLost = firstWeight - latestWeight;

  // First entry
  if (sorted.length === 1 && !hasMilestone(existingMilestones, 'first_entry')) {
    newMilestones.push(makeMilestone('first_entry', 'Logged your first weight! Journey begins.', latestWeight));
  }

  // Weight lost thresholds
  const lostThresholds: Array<[number, MilestoneType]> = [
    [1, 'weight_lost_1'],
    [5, 'weight_lost_5'],
    [10, 'weight_lost_10'],
    [25, 'weight_lost_25'],
  ];
  for (const [threshold, type] of lostThresholds) {
    if (totalLost >= threshold && !hasMilestone(existingMilestones, type)) {
      newMilestones.push(makeMilestone(type, `Lost ${threshold} ${threshold === 1 ? 'lb' : 'lbs'}!`, threshold));
    }
  }

  // Goal % thresholds
  if (goals.startWeight && goals.targetWeight) {
    const total = goals.startWeight - goals.targetWeight;
    if (total > 0) {
      const done = goals.startWeight - latestWeight;
      const pct = (done / total) * 100;

      const pctThresholds: Array<[number, MilestoneType, string]> = [
        [25, 'weight_pct_25', '25% of the way to your goal!'],
        [50, 'weight_pct_50', 'Halfway to your goal!'],
        [75, 'weight_pct_75', '75% of the way there!'],
        [100, 'weight_pct_100', 'Goal weight reached!'],
      ];

      for (const [threshold, type, label] of pctThresholds) {
        if (pct >= threshold && !hasMilestone(existingMilestones, type)) {
          newMilestones.push(makeMilestone(type, label, threshold));
        }
      }

      if (latestWeight <= goals.targetWeight && !hasMilestone(existingMilestones, 'at_goal_weight')) {
        newMilestones.push(makeMilestone('at_goal_weight', 'You reached your goal weight!', latestWeight));
      }
    }
  }

  // Streak milestones
  const streakThresholds: Array<[number, MilestoneType]> = [
    [7, 'streak_7'],
    [30, 'streak_30'],
    [60, 'streak_60'],
    [100, 'streak_100'],
  ];
  for (const [threshold, type] of streakThresholds) {
    if (
      streaks.currentWeighInStreak >= threshold &&
      !hasMilestone(existingMilestones, type)
    ) {
      newMilestones.push(makeMilestone(type, `${threshold}-day weigh-in streak!`, threshold));
    }
  }

  return newMilestones;
}
