import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { MealEntryForm } from '../components/nutrition/MealEntryForm';
import { DailyMacroBar } from '../components/nutrition/DailyMacroBar';
import { MacroPieChart } from '../components/nutrition/MacroPieChart';
import { NutritionTable } from '../components/nutrition/NutritionTable';
import { WeeklyCalorieChart } from '../components/nutrition/WeeklyCalorieChart';
import { useNutritionAnalytics } from '../hooks/useNutritionAnalytics';
import { todayStr, formatDate } from '../utils/dateUtils';
import { parseISO, addDays, format } from 'date-fns';

export function NutritionLog() {
  const [date, setDate] = useState(todayStr());
  const [showForm, setShowForm] = useState(false);
  const { dayMeals, totals, goals, weeklyCalories, macroKcal } = useNutritionAnalytics(date);

  const shiftDate = (delta: number) => {
    const next = format(addDays(parseISO(date), delta), 'yyyy-MM-dd');
    if (next <= todayStr()) setDate(next);
  };

  return (
    <div className="min-h-full">
      <TopBar
        title="Nutrition"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Add Meal {showForm ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        }
      />

      <div className="px-4 md:px-6 py-4 space-y-4 max-w-2xl md:max-w-none mx-auto">

        {/* Date navigator */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-2">
          <button onClick={() => shiftDate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-gray-800">{formatDate(date, 'EEEE, MMMM d')}</p>
            {date !== todayStr() && (
              <button onClick={() => setDate(todayStr())} className="text-xs text-blue-500">Today</button>
            )}
          </div>
          <button onClick={() => shiftDate(1)} disabled={date >= todayStr()}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Add meal form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Add Meal</h2>
            <MealEntryForm date={date} onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {/* Calorie summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Macros</h2>
            <span className="text-lg font-bold text-gray-900 tabular-nums">{totals.calories} <span className="text-xs font-normal text-gray-400">kcal</span></span>
          </div>
          <DailyMacroBar
            calories={totals.calories}
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
            calorieTarget={goals.dailyCalorieTarget}
            proteinTarget={goals.dailyProteinTarget}
            carbTarget={goals.dailyCarbTarget}
            fatTarget={goals.dailyFatTarget}
          />
        </div>

        {/* Macro split + weekly chart side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Macro Split</h2>
            <MacroPieChart proteinKcal={macroKcal.protein} carbsKcal={macroKcal.carbs} fatKcal={macroKcal.fat} totalKcal={totals.calories} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Last 7 Days</h2>
            <WeeklyCalorieChart data={weeklyCalories} />
          </div>
        </div>

        {/* Meal list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Meals · {formatDate(date)}
          </h2>
          <NutritionTable meals={dayMeals} />
        </div>
      </div>
    </div>
  );
}
