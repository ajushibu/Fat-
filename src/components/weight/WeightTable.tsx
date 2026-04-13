import { useState } from 'react';
import { Trash2, SortAsc, SortDesc } from 'lucide-react';
import { useAppStore, useSettings } from '../../store';
import { useWeights } from '../../store';
import { formatDate } from '../../utils/dateUtils';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import type { WeightEntry } from '../../types';

export function WeightTable() {
  const weights = useWeights();
  const deleteWeight = useAppStore((s) => s.deleteWeight);
  const settings = useSettings();
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [deleteTarget, setDeleteTarget] = useState<WeightEntry | null>(null);

  const sorted = [...weights].sort((a, b) =>
    sortDir === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
  );

  if (weights.length === 0) {
    return <p className="text-sm text-gray-400 py-4">No entries yet.</p>;
  }

  const prevMap = new Map<string, number>();
  const chronological = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < chronological.length; i++) {
    prevMap.set(chronological[i].id, chronological[i - 1].weight);
  }

  return (
    <>
      {deleteTarget && (
        <ConfirmDialog
          title="Delete entry?"
          message={`Remove weight entry for ${formatDate(deleteTarget.date)}?`}
          onConfirm={() => {
            deleteWeight(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
                  className="flex items-center gap-1 hover:text-gray-800"
                >
                  Date {sortDir === 'desc' ? <SortDesc size={12} /> : <SortAsc size={12} />}
                </button>
              </th>
              <th className="px-4 py-3 text-right">Weight ({settings.weightUnit})</th>
              <th className="px-4 py-3 text-right">Change</th>
              <th className="px-4 py-3 text-right">Body Fat %</th>
              <th className="px-4 py-3 text-left">Note</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sorted.map((entry) => {
              const prev = prevMap.get(entry.id);
              const delta = prev !== undefined ? Math.round((entry.weight - prev) * 10) / 10 : null;
              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">{formatDate(entry.date)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{entry.weight}</td>
                  <td className="px-4 py-3 text-right">
                    {delta !== null ? (
                      <span className={`font-mono text-xs font-medium ${
                        delta < 0 ? 'text-emerald-600' : delta > 0 ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {entry.bodyFatPct != null ? `${entry.bodyFatPct}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">
                    {entry.note ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(entry)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
