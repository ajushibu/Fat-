import { useState, useEffect } from 'react';
import { useAppStore, useGoals, useSettings, useWeights } from '../../store';
import { todayStr } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export function GoalForm() {
  const goals = useGoals();
  const weights = useWeights();
  const settings = useSettings();
  const updateGoals = useAppStore((s) => s.updateGoals);

  const latestWeight = weights.length > 0
    ? [...weights].sort((a, b) => b.date.localeCompare(a.date))[0].weight
    : null;

  const [targetWeight, setTargetWeight] = useState(String(goals.targetWeight ?? ''));
  const [targetDate, setTargetDate] = useState(goals.targetDate ?? '');
  const [weeklyTarget, setWeeklyTarget] = useState(String(goals.weeklyWeightLossTarget));
  const [calTarget, setCalTarget] = useState(String(goals.dailyCalorieTarget ?? ''));
  const [proteinTarget, setProteinTarget] = useState(String(goals.dailyProteinTarget ?? ''));
  const [carbTarget, setCarbTarget] = useState(String(goals.dailyCarbTarget ?? ''));
  const [fatTarget, setFatTarget] = useState(String(goals.dailyFatTarget ?? ''));

  useEffect(() => {
    setTargetWeight(String(goals.targetWeight ?? ''));
    setTargetDate(goals.targetDate ?? '');
  }, [goals.targetWeight, goals.targetDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoals({
      targetWeight: targetWeight ? +targetWeight : null,
      startWeight: goals.startWeight ?? latestWeight,
      startDate: goals.startDate ?? todayStr(),
      targetDate: targetDate || null,
      weeklyWeightLossTarget: +weeklyTarget || 0.5,
      dailyCalorieTarget: calTarget ? +calTarget : null,
      dailyProteinTarget: proteinTarget ? +proteinTarget : null,
      dailyCarbTarget: carbTarget ? +carbTarget : null,
      dailyFatTarget: fatTarget ? +fatTarget : null,
    });
    toast.success('Goals saved!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Target Weight ({settings.weightUnit})
          </label>
          <input type="number" step="0.1" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)}
            placeholder={settings.weightUnit === 'lbs' ? '160' : '73'}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Target Date (optional)</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} min={todayStr()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Weekly Loss Target ({settings.weightUnit}/week)
          </label>
          <select value={weeklyTarget} onChange={(e) => setWeeklyTarget(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
            {(settings.weightUnit === 'lbs'
              ? [['0.5', '0.5 lbs/week (slow)'], ['1', '1 lb/week (moderate)'], ['1.5', '1.5 lbs/week (fast)'], ['2', '2 lbs/week (aggressive)']]
              : [['0.25', '0.25 kg/week (slow)'], ['0.5', '0.5 kg/week (moderate)'], ['0.75', '0.75 kg/week (fast)'], ['1', '1 kg/week (aggressive)']]
            ).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Daily Calorie Target</label>
          <input type="number" value={calTarget} onChange={(e) => setCalTarget(e.target.value)} placeholder="1800"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Daily Macro Targets (optional)</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Protein (g)', val: proteinTarget, set: setProteinTarget, ph: '150' },
            { label: 'Carbs (g)', val: carbTarget, set: setCarbTarget, ph: '200' },
            { label: 'Fat (g)', val: fatTarget, set: setFatTarget, ph: '60' },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          ))}
        </div>
      </div>

      <button type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">
        Save Goals
      </button>
    </form>
  );
}
