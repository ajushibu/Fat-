interface MacroBarProps {
  label: string;
  value: number;
  target: number | null;
  unit: string;
  color: string;
}

function MacroBar({ label, value, target, unit, color }: MacroBarProps) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  const over = target ? value > target : false;
  const barColor = !target ? 'bg-gray-300' : over ? 'bg-red-500' : pct > 90 ? 'bg-amber-400' : color;

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span className="font-medium">{label}</span>
        <span>
          <span className={`font-semibold ${over ? 'text-red-600' : 'text-gray-800'}`}>{Math.round(value)}</span>
          {target && <span className="text-gray-400"> / {target} {unit}</span>}
          {!target && <span className="text-gray-500"> {unit}</span>}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: target ? `${pct}%` : '0%' }}
        />
      </div>
      {target && (
        <p className="mt-0.5 text-right text-xs text-gray-400">
          {over
            ? `+${Math.round(value - target)} over`
            : `${Math.round(target - value)} remaining`}
        </p>
      )}
    </div>
  );
}

interface DailyMacroBarProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;
}

export function DailyMacroBar({
  calories, protein, carbs, fat,
  calorieTarget, proteinTarget, carbTarget, fatTarget,
}: DailyMacroBarProps) {
  return (
    <div className="space-y-3">
      <MacroBar label="Calories" value={calories} target={calorieTarget} unit="kcal" color="bg-purple-500" />
      <MacroBar label="Protein" value={protein} target={proteinTarget} unit="g" color="bg-blue-500" />
      <MacroBar label="Carbs" value={carbs} target={carbTarget} unit="g" color="bg-amber-400" />
      <MacroBar label="Fat" value={fat} target={fatTarget} unit="g" color="bg-rose-400" />
    </div>
  );
}
