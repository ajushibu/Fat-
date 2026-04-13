import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from 'recharts';
import { dayLabel } from '../../utils/dateUtils';

interface DayData {
  date: string;
  calories: number;
  target?: number;
  delta?: number;
}

interface WeeklyCalorieChartProps {
  data: DayData[];
}

export function WeeklyCalorieChart({ data }: WeeklyCalorieChartProps) {
  const target = data.find((d) => d.target)?.target;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={dayLabel}
          tick={{ fontSize: 11 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={45}
        />
        <Tooltip
          formatter={(val) => [`${val} kcal`, 'Calories']}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(label: any) => dayLabel(String(label))}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        {target && (
          <ReferenceLine
            y={target}
            stroke="#6366f1"
            strokeDasharray="5 3"
            label={{ value: `${target} target`, fontSize: 10, fill: '#6366f1', position: 'right' }}
          />
        )}
        <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => {
            const over = target && entry.calories > target;
            const empty = entry.calories === 0;
            return (
              <Cell
                key={i}
                fill={empty ? '#e5e7eb' : over ? '#ef4444' : '#10b981'}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
