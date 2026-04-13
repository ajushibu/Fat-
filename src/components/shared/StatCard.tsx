interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number | null;
  deltaLabel?: string;
  color?: 'default' | 'green' | 'blue' | 'amber' | 'red';
  icon?: React.ReactNode;
}

const colorMap = {
  default: 'bg-white',
  green: 'bg-emerald-50',
  blue: 'bg-blue-50',
  amber: 'bg-amber-50',
  red: 'bg-red-50',
};

export function StatCard({ label, value, unit, delta, deltaLabel, color = 'default', icon }: StatCardProps) {
  const deltaPositive = delta !== null && delta !== undefined && delta < 0;
  const deltaNeutral = delta === 0 || delta === null || delta === undefined;

  return (
    <div className={`rounded-xl border border-gray-200 p-4 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {delta !== null && delta !== undefined && (
        <p className={`mt-1 text-xs font-medium ${
          deltaNeutral ? 'text-gray-400' :
          deltaPositive ? 'text-emerald-600' : 'text-red-500'
        }`}>
          {delta > 0 ? '+' : ''}{delta} {deltaLabel}
        </p>
      )}
    </div>
  );
}
