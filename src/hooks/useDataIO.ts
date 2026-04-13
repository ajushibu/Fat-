import { useAppStore } from '../store';
import { format } from 'date-fns';
import Papa from 'papaparse';

export function useDataIO() {
  const store = useAppStore();

  const exportJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      weights: store.weights,
      meals: store.meals,
      goals: store.goals,
      milestones: store.milestones,
      streaks: store.streaks,
      settings: store.settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weight-tracker-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportWeightCSV = () => {
    const csv = Papa.unparse(
      store.weights.map((w) => ({
        date: w.date,
        weight: w.weight,
        body_fat_pct: w.bodyFatPct ?? '',
        note: w.note ?? '',
      }))
    );
    downloadCSV(csv, `weight-log-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportNutritionCSV = () => {
    const csv = Papa.unparse(
      store.meals.map((m) => ({
        date: m.date,
        meal_type: m.mealType,
        name: m.name,
        calories: m.calories,
        protein_g: m.protein,
        carbs_g: m.carbs,
        fat_g: m.fat,
        fiber_g: m.fiber ?? '',
        serving_size: m.servingSize ?? '',
      }))
    );
    downloadCSV(csv, `nutrition-log-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const importJSON = async (file: File): Promise<{ success: boolean; message: string }> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.weights) {
        for (const w of data.weights) {
          if (!store.weights.find((existing) => existing.date === w.date)) {
            store.addWeight(w);
          }
        }
      }
      if (data.meals) {
        for (const m of data.meals) {
          if (!store.meals.find((existing) => existing.id === m.id)) {
            store.addMeal(m);
          }
        }
      }
      if (data.goals) store.updateGoals(data.goals);
      if (data.settings) store.updateSettings(data.settings);

      return { success: true, message: `Imported ${data.weights?.length ?? 0} weight entries and ${data.meals?.length ?? 0} meals.` };
    } catch {
      return { success: false, message: 'Failed to parse JSON file.' };
    }
  };

  return { exportJSON, exportWeightCSV, exportNutritionCSV, importJSON };
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
