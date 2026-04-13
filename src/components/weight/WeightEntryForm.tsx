import { useState, useEffect } from 'react';
import { useAppStore, useSettings } from '../../store';
import { todayStr } from '../../utils/dateUtils';
import { isValidWeight } from '../../utils/validators';
import toast from 'react-hot-toast';

interface WeightEntryFormProps {
  compact?: boolean;
  onSuccess?: () => void;
}

export function WeightEntryForm({ compact = false, onSuccess }: WeightEntryFormProps) {
  const addWeight = useAppStore((s) => s.addWeight);
  const updateWeight = useAppStore((s) => s.updateWeight);
  const getWeightForDate = useAppStore((s) => s.getWeightForDate);
  const settings = useSettings();

  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [note, setNote] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const existing = getWeightForDate(date);
    if (existing) {
      setWeight(String(existing.weight));
      setBodyFat(existing.bodyFatPct != null ? String(existing.bodyFatPct) : '');
      setNote(existing.note ?? '');
      setIsEdit(true);
      setEditId(existing.id);
    } else {
      setWeight('');
      setBodyFat('');
      setNote('');
      setIsEdit(false);
      setEditId(null);
    }
  }, [date, getWeightForDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidWeight(weight)) {
      toast.error('Please enter a valid weight.');
      return;
    }

    const entry = {
      date,
      weight: parseFloat(weight),
      bodyFatPct: bodyFat ? parseFloat(bodyFat) : null,
      note: note.trim() || null,
    };

    if (isEdit && editId) {
      updateWeight(editId, entry);
      toast.success('Weight updated!');
    } else {
      addWeight(entry);
      toast.success('Weight logged!');
    }

    if (!compact) {
      setWeight('');
      setBodyFat('');
      setNote('');
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {isEdit && (
        <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
          Editing existing entry for this date
        </div>
      )}
      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayStr()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Weight ({settings.weightUnit})
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="999"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={settings.weightUnit === 'lbs' ? '185.0' : '84.0'}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Body Fat % (optional)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="60"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="20.0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="After workout, morning..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      )}
      <button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
      >
        {isEdit ? 'Update Weight' : 'Log Weight'}
      </button>
    </form>
  );
}
