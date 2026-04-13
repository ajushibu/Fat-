import { TopBar } from '../components/layout/TopBar';
import { HabitScoreGauge } from '../components/analytics/HabitScoreGauge';
import { ExportPanel } from '../components/analytics/ExportPanel';
import { StatCard } from '../components/shared/StatCard';
import { WeightChart } from '../components/weight/WeightChart';
import { useWeightAnalytics } from '../hooks/useWeightAnalytics';
import { useSettings, useStreaks, useWeights, useMeals } from '../store';
import { formatDate } from '../utils/dateUtils';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Analytics() {
  const { trend, chartData, totalLost, avgWeight } = useWeightAnalytics();
  const settings = useSettings();
  const streaks = useStreaks();
  const weights = useWeights();
  const meals = useMeals();
  const unit = settings.weightUnit;

  const scatterData = weights.map((w) => {
    const cal = meals.filter((m) => m.date === w.date).reduce((s, m) => s + m.calories, 0);
    return cal > 0 ? { weight: w.weight, calories: cal, date: w.date } : null;
  }).filter(Boolean) as { weight: number; calories: number; date: string }[];

  return (
    <div className="min-h-full">
      <TopBar title="Analytics" />

      <div className="px-4 md:px-6 py-4 space-y-4 max-w-2xl md:max-w-none mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Lost" value={totalLost !== null && totalLost > 0 ? totalLost : '—'} unit={unit} color={totalLost !== null && totalLost > 0 ? 'green' : 'default'} />
          <StatCard label="Avg Weight" value={avgWeight ?? '—'} unit={unit} />
          <StatCard label="Best Streak" value={streaks.longestWeighInStreak} unit="days" />
          <StatCard
            label="Rate"
            value={trend.direction === 'losing' ? `−${Math.abs(trend.ratePerWeek)}` : trend.direction === 'gaining' ? `+${trend.ratePerWeek}` : '—'}
            unit={`${unit}/wk`}
            color={trend.direction === 'losing' ? 'green' : trend.direction === 'gaining' ? 'red' : 'default'}
          />
        </div>

        {/* Habit score */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">This Week's Habit Score</h2>
          <HabitScoreGauge />
        </div>

        {/* All-time chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">All-Time Trend</h2>
          <WeightChart data={chartData} />
        </div>

        {/* Scatter */}
        {scatterData.length >= 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Weight vs Calories</h2>
            <p className="text-xs text-gray-400 mb-3">Days with both entries logged</p>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart margin={{ top: 5, right: 5, left: 0, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="calories" name="Calories" tick={{ fontSize: 10 }} label={{ value: 'kcal', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis dataKey="weight" name="Weight" unit={` ${unit}`} tick={{ fontSize: 10 }} width={50} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs shadow-md">
                        <p className="font-medium">{formatDate(d.date)}</p>
                        <p className="text-gray-500">{d.weight} {unit} · {d.calories} kcal</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill="#6366f1" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly habit history */}
        {streaks.weeklyHabitScores.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Weekly History</h2>
            <div className="space-y-2">
              {[...streaks.weeklyHabitScores]
                .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
                .slice(0, 8)
                .map((s) => (
                  <div key={s.weekStart} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-20 shrink-0">{formatDate(s.weekStart, 'MMM d')}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.score >= 70 ? 'bg-emerald-400' : s.score >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold w-8 text-right ${s.score >= 70 ? 'text-emerald-600' : s.score >= 40 ? 'text-amber-500' : 'text-red-400'}`}>{s.score}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Export */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Export & Import</h2>
          <ExportPanel />
        </div>
      </div>
    </div>
  );
}
