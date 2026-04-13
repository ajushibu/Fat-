import { useNavigate } from 'react-router-dom';
import { Scale, UtensilsCrossed, Target, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { StatCard } from '../components/shared/StatCard';
import { WeightEntryForm } from '../components/weight/WeightEntryForm';
import { useWeightAnalytics } from '../hooks/useWeightAnalytics';
import { useNutritionAnalytics } from '../hooks/useNutritionAnalytics';
import { useAppStore, useSettings, useStreaks, useGoals } from '../store';
import { todayStr, formatDate, last7Days, dayLabel } from '../utils/dateUtils';
import { useWeights, useMeals } from '../store';

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

  // Last 7 days summary
  const weekDays = last7Days();
  const weighInDateSet = new Set(weights.map((w) => w.date));
  const mealDateSet = new Set(meals.map((m) => m.date));

  const trendIcon =
    trend.direction === 'losing' ? <TrendingDown size={14} className="text-emerald-500" /> :
    trend.direction === 'gaining' ? <TrendingUp size={14} className="text-red-500" /> :
    <Minus size={14} className="text-gray-400" />;

  return (
    <div>
      <TopBar
        title="Dashboard"
        subtitle={`Welcome back · ${formatDate(today, 'EEEE, MMMM d')}`}
      />

      <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Current Weight"
            value={latest?.weight ?? '—'}
            unit={unit}
            delta={weekDelta}
            deltaLabel={`${unit} vs last week`}
            color={weekDelta !== null && weekDelta < 0 ? 'green' : 'default'}
            icon={<Scale size={16} />}
          />
          <StatCard
            label="Today's Calories"
            value={totals.calories}
            unit="kcal"
            delta={calorieDelta}
            deltaLabel="vs target"
            color={calorieDelta !== null ? (calorieDelta <= 0 ? 'green' : 'amber') : 'default'}
            icon={<UtensilsCrossed size={16} />}
          />
          <StatCard
            label="Streak"
            value={streaks.currentWeighInStreak}
            unit="days"
            icon={<span className="text-base">🔥</span>}
            color={streaks.currentWeighInStreak >= 7 ? 'amber' : 'default'}
          />
          <StatCard
            label="Goal Progress"
            value={goals.targetWeight ? `${goalProgress.toFixed(1)}%` : '—'}
            icon={<Target size={16} />}
            color={goalProgress >= 50 ? 'green' : 'default'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Scale size={15} /> Log Today's Weight
            </h2>
            <WeightEntryForm compact={false} onSuccess={() => {}} />
          </div>

          {/* Weekly summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              {trendIcon} Last 7 Days
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-gray-400 uppercase tracking-wide">
                  <tr>
                    <th className="py-1.5 text-left">Day</th>
                    <th className="py-1.5 text-right">Weight</th>
                    <th className="py-1.5 text-right">Calories</th>
                    <th className="py-1.5 text-center">Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {weekDays.map((d) => {
                    const w = weights.find((e) => e.date === d);
                    const dayMeals = meals.filter((m) => m.date === d);
                    const dayCal = dayMeals.reduce((s, m) => s + m.calories, 0);
                    const hasLog = weighInDateSet.has(d) || mealDateSet.has(d);
                    const isToday = d === today;

                    return (
                      <tr key={d} className={isToday ? 'bg-emerald-50/50' : ''}>
                        <td className="py-2 font-medium text-gray-600">
                          {dayLabel(d)}{isToday ? ' (today)' : ''}
                        </td>
                        <td className="py-2 text-right font-mono text-gray-700">
                          {w ? `${w.weight} ${unit}` : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-2 text-right font-mono text-gray-700">
                          {dayCal > 0 ? dayCal : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-2 text-center">
                          {hasLog ? <span className="text-emerald-500">✓</span> : <span className="text-gray-200">○</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        {(latest === null || totals.calories === 0) && (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Get started</h2>
            <div className="flex flex-wrap gap-3">
              {latest === null && (
                <button onClick={() => navigate('/weight')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                  Log first weight
                </button>
              )}
              {!goals.targetWeight && (
                <button onClick={() => navigate('/goals')}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Set a goal
                </button>
              )}
              {totals.calories === 0 && (
                <button onClick={() => navigate('/nutrition')}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Log today's meals
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
