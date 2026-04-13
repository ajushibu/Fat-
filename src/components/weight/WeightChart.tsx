import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  Brush,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '../../types';
import { formatDateShort } from '../../utils/dateUtils';
import { useGoals, useSettings } from '../../store';

interface WeightChartProps {
  data: ChartDataPoint[];
}

export function WeightChart({ data }: WeightChartProps) {
  const goals = useGoals();
  const settings = useSettings();
  const unit = settings.weightUnit;

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        No data yet — log your first weight to see the chart
      </div>
    );
  }

  const weights = data.filter((d) => d.weight !== undefined).map((d) => d.weight as number);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const padding = Math.max(2, (maxW - minW) * 0.1);
  const domain: [number, number] = [Math.floor(minW - padding), Math.ceil(maxW + padding)];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          tick={{ fontSize: 11 }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={domain}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit={` ${unit}`}
          width={60}
        />
        <Tooltip
          formatter={(val, name) => [
            `${val} ${unit}`,
            name === 'weight' ? 'Weight' : name === 'ma7' ? '7-day avg' : '30-day avg',
          ]}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(label: any) => formatDateShort(String(label))}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend
          formatter={(val) =>
            val === 'weight' ? 'Daily' : val === 'ma7' ? '7-day avg' : '30-day avg'
          }
          iconSize={10}
          wrapperStyle={{ fontSize: 12 }}
        />
        {goals.targetWeight && (
          <ReferenceLine
            y={goals.targetWeight}
            stroke="#10b981"
            strokeDasharray="6 3"
            label={{ value: `Goal: ${goals.targetWeight} ${unit}`, fontSize: 11, fill: '#10b981', position: 'right' }}
          />
        )}
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#94a3b8"
          strokeWidth={1.5}
          dot={{ r: 2, fill: '#94a3b8' }}
          activeDot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="ma7"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="ma30"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          connectNulls
        />
        {data.length > 14 && (
          <Brush
            dataKey="date"
            height={20}
            stroke="#e5e7eb"
            tickFormatter={formatDateShort}
            travellerWidth={6}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
