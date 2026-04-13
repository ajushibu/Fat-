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
  const deltaDown = delta !== null && delta !== undefined && delta < 0;
  const deltaNeutral = delta === 0 || delta === null || delta === undefined;

  return (
    <div className={`rounded-2xl border border-gray-100 p-3.5 flex flex-col gap-1 shadow-sm ${colorMap[color]}`}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
        {icon && <span className="text-gray-300 shrink-0">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1 min-w-0">
        <span className="text-xl font-bold text-gray-900 tabular-nums truncate">{value}</span>
        {unit && <span className="text-xs text-gray-400 shrink-0">{unit}</span>}
      </div>
      {delta !== null && delta !== undefined && (
        <p className={`text-[11px] font-medium truncate ${
          deltaNeutral ? 'text-gray-300' :
          deltaDown ? 'text-emerald-500' : 'text-red-400'
        }`}>
          {delta > 0 ? '+' : ''}{delta} {deltaLabel}
        </p>
      )}
    </div>
  );
}
