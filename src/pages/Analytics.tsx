import { TopBar } from '../components/layout/TopBar';
import { HabitScoreGauge } from '../components/analytics/HabitScoreGauge';
import { ExportPanel } from '../components/analytics/ExportPanel';
import { StatCard } from '../components/shared/StatCard';
import { WeightChart } from '../components/weight/WeightChart';
import { useWeightAnalytics } from '../hooks/useWeightAnalytics';
import { useSettings, useStreaks, useWeights } from '../store';
import { formatDate } from '../utils/dateUtils';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMeals } from '../store';

export function Analytics() {
  const { trend, chartData, totalLost, avgWeight } = useWeightAnalytics();
  const settings = useSettings();
  const streaks = useStreaks();
  const weights = useWeights();
  const meals = useMeals();
  const unit = settings.weightUnit;

  // Weight vs Calories scatter data
  const weightVsCalScatter = weights.map((w) => {
    const dayMeals = meals.filter((m) => m.date === w.date);
    const dayCal = dayMeals.reduce((s, m) => s + m.calories, 0);
    return dayCal > 0 ? { weight: w.weight, calories: dayCal, date: w.date } : null;
  }).filter(Boolean) as { weight: number; calories: number; date: string }[];

  const longestStreak = streaks.longestWeighInStreak;

  return (
    <div>
      <TopBar title="Analytics" subtitle="Deep dives, habit scoring & data export" />

      <div className="p-6 space-y-6">
        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Lost" value={totalLost !== null && totalLost > 0 ? totalLost : 0} unit={unit} color={totalLost !== null && totalLost > 0 ? 'green' : 'default'} />
          <StatCard label="Avg Weight" value={avgWeight ?? '—'} unit={unit} />
          <StatCard label="Longest Streak" value={longestStreak} unit="days" />
          <StatCard
            label="Trend"
            value={
              trend.direction === 'losing' ? `−${Math.abs(trend.ratePerWeek)}` :
              trend.direction === 'gaining' ? `+${trend.ratePerWeek}` : '0'
            }
            unit={`${unit}/wk`}
            color={trend.direction === 'losing' ? 'green' : trend.direction === 'gaining' ? 'red' : 'default'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Habit score */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
            <HabitScoreGauge />
          </div>

          {/* Full weight chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">All-Time Weight Trend</h2>
            <WeightChart data={chartData} />
          </div>
        </div>

        {/* Scatter: Weight vs Calories */}
        {weightVsCalScatter.length >= 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Weight vs. Calories</h2>
            <p className="text-xs text-gray-400 mb-4">Days with both weight and nutrition logged</p>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="calories" name="Calories" unit=" kcal"
                  tick={{ fontSize: 11 }} label={{ value: 'Calories', position: 'insideBottom', offset: -2, fontSize: 11 }}
                />
                <YAxis
                  dataKey="weight" name="Weight" unit={` ${unit}`}
                  tick={{ fontSize: 11 }} width={55}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs shadow">
                        <p>{formatDate(d.date)}</p>
                        <p>{d.weight} {unit}</p>
                        <p>{d.calories} kcal</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={weightVsCalScatter} fill="#6366f1" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Streak history */}
        {streaks.weeklyHabitScores.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Habit History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-400 uppercase tracking-wide">
                  <tr>
                    <th className="py-2 text-left">Week of</th>
                    <th className="py-2 text-right">Weigh-in days</th>
                    <th className="py-2 text-right">Calorie goal days</th>
                    <th className="py-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...streaks.weeklyHabitScores]
                    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
                    .slice(0, 12)
                    .map((s) => (
                      <tr key={s.weekStart} className="hover:bg-gray-50">
                        <td className="py-2 text-gray-700">{formatDate(s.weekStart)}</td>
                        <td className="py-2 text-right text-gray-600">{s.weighInDays}/7</td>
                        <td className="py-2 text-right text-gray-600">{s.calorieGoalDays}/7</td>
                        <td className="py-2 text-right">
                          <span className={`font-semibold ${
                            s.score >= 70 ? 'text-emerald-600' :
                            s.score >= 40 ? 'text-amber-500' : 'text-red-500'
                          }`}>{s.score}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Export */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Export & Import</h2>
          <ExportPanel />
        </div>
      </div>
    </div>
  );
}
