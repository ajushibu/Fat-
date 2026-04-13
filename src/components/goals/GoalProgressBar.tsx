import { useSettings } from '../../store';

interface GoalProgressBarProps {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
}

export function GoalProgressBar({ startWeight, currentWeight, targetWeight }: GoalProgressBarProps) {
  const settings = useSettings();
  const unit = settings.weightUnit;

  const total = startWeight - targetWeight;
  const done = startWeight - currentWeight;
  const pct = total > 0 ? Math.max(0, Math.min(100, (done / total) * 100)) : 0;
  const remaining = Math.max(0, currentWeight - targetWeight);

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>Start: {startWeight} {unit}</span>
        <span className="font-semibold text-gray-700">{pct.toFixed(1)}% to goal</span>
        <span>Goal: {targetWeight} {unit}</span>
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
        {pct > 0 && pct < 95 && (
          <span className="absolute inset-0 flex items-center pl-2 text-xs font-semibold text-white" style={{ paddingLeft: `${pct - 2}%` }}>
            {pct > 10 ? `${pct.toFixed(0)}%` : ''}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-gray-500">
        <span className="text-emerald-600 font-medium">Lost: {Math.round(done * 10) / 10} {unit}</span>
        <span>{remaining > 0 ? `${Math.round(remaining * 10) / 10} ${unit} to go` : 'Goal reached!'}</span>
      </div>
    </div>
  );
}
