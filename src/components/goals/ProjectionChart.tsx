import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartDataPoint } from '../../types';
import { formatDateShort } from '../../utils/dateUtils';
import { useSettings } from '../../store';

interface ProjectionChartProps {
  data: ChartDataPoint[];
  targetWeight: number | null;
}

export function ProjectionChart({ data, targetWeight }: ProjectionChartProps) {
  const settings = useSettings();
  const unit = settings.weightUnit;

  if (data.length === 0) return null;

  const allValues = data.flatMap((d) => [d.weight, d.projected].filter(Boolean) as number[]);
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const pad = Math.max(2, (maxV - minV) * 0.1);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
        <YAxis
          domain={[Math.floor(minV - pad), Math.ceil(maxV + pad)]}
          tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
          unit={` ${unit}`} width={60}
        />
        <Tooltip
          formatter={(val, name) => [
            `${val} ${unit}`,
            name === 'weight' ? 'Actual' : 'Projected',
          ]}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(label: any) => formatDateShort(String(label))}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend formatter={(v) => (v === 'weight' ? 'Actual' : 'Projected')} iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="#10b981"
            strokeDasharray="6 3"
            label={{ value: `Goal: ${targetWeight}`, fontSize: 11, fill: '#10b981', position: 'right' }}
          />
        )}
        <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 2 }} connectNulls />
        <Line type="monotone" dataKey="projected" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
