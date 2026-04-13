import { useNavigate } from 'react-router-dom';
import { Scale, UtensilsCrossed, Target, TrendingDown, TrendingUp, Flame, CheckCircle2, Circle } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { StatCard } from '../components/shared/StatCard';
import { WeightEntryForm } from '../components/weight/WeightEntryForm';
import { useWeightAnalytics } from '../hooks/useWeightAnalytics';
import { useNutritionAnalytics } from '../hooks/useNutritionAnalytics';
import { useSettings, useStreaks, useGoals, useWeights, useMeals, useAppStore } from '../store';
import { todayStr, last7Days, dayLabel } from '../utils/dateUtils';

export function Dashboard() {
  const { latest, weekDelta, trend } = useWeightAnalytics();
  const today = todayStr();
  const { totals, calorieDelta } = useNutritionAnalytics(today);
  const streaks = useStreaks();
  const goals = useGoals();
  const settings = useSettings();
  const weights = useWeights();
  const meals = useMeals();
  const navigate = useNavigate();
  const getGoalProgress = useAppStore((s) => s.getGoalProgress);

  const goalProgress = getGoalProgress(latest?.weight ?? null);
  const unit = settings.weightUnit;
  const weekDays = last7Days();
  const weighInSet = new Set(weights.map((w) => w.date));
  const mealSet = new Set(meals.map((m) => m.date));

  const trendColor = trend.direction === 'losing' ? 'text-emerald-500' : trend.direction === 'gaining' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="min-h-full">
      <TopBar title="Dashboard" />

      <div className="px-4 md:px-6 py-4 space-y-4 max-w-2xl md:max-w-none mx-auto">

        {/* Greeting + date */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            {latest && (
              <p className="text-sm font-medium text-gray-700 mt-0.5 flex items-center gap-1.5">
                <span className={trendColor}>
                  {trend.direction === 'losing' ? <TrendingDown size={14} /> : trend.direction === 'gaining' ? <TrendingUp size={14} /> : null}
                </span>
                {trend.direction === 'losing'
                  ? `Losing ${Math.abs(trend.ratePerWeek)} ${unit}/wk`
                  : trend.direction === 'gaining'
                  ? `Gaining ${trend.ratePerWeek} ${unit}/wk`
                  : 'Weight stable'}
              </p>
            )}
          </div>
          {streaks.currentWeighInStreak > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 rounded-xl px-3 py-1.5">
              <Flame size={16} className="text-orange-400" />
              <span className="text-sm font-bold text-orange-500">{streaks.currentWeighInStreak}</span>
              <span className="text-xs text-orange-400">day streak</span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Current Weight"
            value={latest?.weight ?? '—'}
            unit={unit}
            delta={weekDelta}
            deltaLabel={`${unit} this week`}
            color={weekDelta !== null && weekDelta < 0 ? 'green' : 'default'}
            icon={<Scale size={14} />}
          />
          <StatCard
            label="Calories Today"
            value={totals.calories || '—'}
            unit={totals.calories ? 'kcal' : ''}
            delta={calorieDelta}
            deltaLabel="vs goal"
            color={calorieDelta !== null ? (calorieDelta <= 0 ? 'green' : 'amber') : 'default'}
            icon={<UtensilsCrossed size={14} />}
          />
          <StatCard
            label="Goal Progress"
            value={goals.targetWeight ? `${goalProgress.toFixed(0)}%` : '—'}
            icon={<Target size={14} />}
            color={goalProgress >= 50 ? 'green' : 'default'}
          />
          <StatCard
            label="Best Streak"
            value={streaks.longestWeighInStreak || 0}
            unit="days"
            icon={<Flame size={14} />}
            color={streaks.longestWeighInStreak >= 7 ? 'amber' : 'default'}
          />
        </div>

        {/* Quick log weight */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Scale size={15} className="text-emerald-500" />
            Log Today's Weight
          </h2>
          <WeightEntryForm compact={false} />
        </div>

        {/* 7-day log summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Last 7 Days</h2>
          <div className="space-y-1.5">
            {weekDays.map((d) => {
              const w = weights.find((e) => e.date === d);
              const dayMeals = meals.filter((m) => m.date === d);
              const dayCal = dayMeals.reduce((s, m) => s + m.calories, 0);
              const hasLog = weighInSet.has(d) || mealSet.has(d);
              const isToday = d === today;

              return (
                <div key={d} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isToday ? 'bg-emerald-50' : ''}`}>
                  <span className="text-xs font-medium text-gray-400 w-8 shrink-0">{dayLabel(d)}</span>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {w ? (
                      <span className="text-sm font-semibold text-gray-800 tabular-nums">{w.weight} {unit}</span>
                    ) : (
                      <span className="text-sm text-gray-200">No weight</span>
                    )}
                    {dayCal > 0 && (
                      <span className="text-xs text-gray-400 truncate">· {dayCal} kcal</span>
                    )}
                  </div>
                  {hasLog
                    ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    : <Circle size={14} className="text-gray-200 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions — only if no data yet */}
        {!latest && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 space-y-3">
            <p className="text-sm font-semibold text-emerald-800">Get started</p>
            <p className="text-xs text-emerald-600">Log your first weight, set a goal, and track meals to unlock all analytics.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate('/goals')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors">
                Set a goal
              </button>
              <button onClick={() => navigate('/nutrition')}
                className="px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-50 transition-colors">
                Log meals
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
