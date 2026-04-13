import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MacroPieChartProps {
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  totalKcal: number;
}

const COLORS = ['#3b82f6', '#f59e0b', '#f43f5e'];
const LABELS = ['Protein', 'Carbs', 'Fat'];

export function MacroPieChart({ proteinKcal, carbsKcal, fatKcal, totalKcal }: MacroPieChartProps) {
  if (totalKcal === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-sm text-gray-400">
        No meals logged today
      </div>
    );
  }

  const data = [
    { name: 'Protein', value: proteinKcal },
    { name: 'Carbs', value: carbsKcal },
    { name: 'Fat', value: fatKcal },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          dataKey="value"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={LABELS[i]} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val) => [`${val} kcal`, '']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
