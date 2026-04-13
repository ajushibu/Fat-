import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../../store';
import { weekStartStr } from '../../utils/dateUtils';

export function HabitScoreGauge() {
  const weeklyHabitScores = useAppStore((s) => s.streaks.weeklyHabitScores);
  const thisWeek = weeklyHabitScores.find((s) => s.weekStart === weekStartStr());
  const score = thisWeek?.score ?? 0;

  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const data = [{ value: score, fill: color }];

  const last4 = [...weeklyHabitScores]
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    .slice(0, 4);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ResponsiveContainer width={160} height={100}>
          <RadialBarChart
            cx="50%"
            cy="90%"
            innerRadius="60%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={data}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#f3f4f6' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-1 inset-x-0 text-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 mt-1">This Week's Habit Score</p>

      {last4.length > 1 && (
        <div className="mt-3 flex gap-2">
          {last4.reverse().map((s) => {
            const c = s.score >= 70 ? 'bg-emerald-400' : s.score >= 40 ? 'bg-amber-400' : 'bg-red-400';
            return (
              <div key={s.weekStart} className="flex flex-col items-center gap-1">
                <div className={`w-5 rounded-sm ${c}`} style={{ height: `${Math.max(4, s.score * 0.32)}px` }} />
                <span className="text-xs text-gray-400">{s.score}</span>
              </div>
            );
          })}
        </div>
      )}

      {thisWeek && (
        <div className="mt-3 text-xs text-gray-500 text-center space-y-0.5">
          <div>Weigh-in days: <span className="font-medium">{thisWeek.weighInDays}/7</span></div>
          <div>Calorie goal days: <span className="font-medium">{thisWeek.calorieGoalDays}/7</span></div>
        </div>
      )}
    </div>
  );
}
