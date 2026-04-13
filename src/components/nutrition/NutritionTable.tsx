import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import type { MealEntry, MealType } from '../../types';

interface NutritionTableProps {
  meals: MealEntry[];
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_COLORS: Record<MealType, string> = {
  breakfast: 'bg-amber-100 text-amber-700',
  lunch: 'bg-blue-100 text-blue-700',
  dinner: 'bg-purple-100 text-purple-700',
  snack: 'bg-green-100 text-green-700',
};

export function NutritionTable({ meals }: NutritionTableProps) {
  const deleteMeal = useAppStore((s) => s.deleteMeal);
  const [deleteTarget, setDeleteTarget] = useState<MealEntry | null>(null);

  if (meals.length === 0) return <p className="text-sm text-gray-400 py-4">No meals logged.</p>;

  const sorted = [...meals].sort(
    (a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType)
  );

  return (
    <>
      {deleteTarget && (
        <ConfirmDialog
          title="Delete meal?"
          message={`Remove "${deleteTarget.name}"?`}
          onConfirm={() => { deleteMeal(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Meal</th>
              <th className="px-4 py-3 text-left">Food</th>
              <th className="px-4 py-3 text-right">kcal</th>
              <th className="px-4 py-3 text-right">Protein</th>
              <th className="px-4 py-3 text-right">Carbs</th>
              <th className="px-4 py-3 text-right">Fat</th>
              <th className="px-4 py-3 text-right">Serving</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sorted.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${MEAL_COLORS[m.mealType]}`}>
                    {m.mealType}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-medium text-gray-700">{m.name}</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold">{m.calories}</td>
                <td className="px-4 py-2.5 text-right text-gray-600">{m.protein}g</td>
                <td className="px-4 py-2.5 text-right text-gray-600">{m.carbs}g</td>
                <td className="px-4 py-2.5 text-right text-gray-600">{m.fat}g</td>
                <td className="px-4 py-2.5 text-right text-gray-400 text-xs">{m.servingSize ?? '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => setDeleteTarget(m)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 text-xs font-semibold text-gray-600">
            <tr>
              <td className="px-4 py-2.5" colSpan={2}>Total</td>
              <td className="px-4 py-2.5 text-right font-mono">{meals.reduce((s, m) => s + m.calories, 0)}</td>
              <td className="px-4 py-2.5 text-right">{Math.round(meals.reduce((s, m) => s + m.protein, 0))}g</td>
              <td className="px-4 py-2.5 text-right">{Math.round(meals.reduce((s, m) => s + m.carbs, 0))}g</td>
              <td className="px-4 py-2.5 text-right">{Math.round(meals.reduce((s, m) => s + m.fat, 0))}g</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
