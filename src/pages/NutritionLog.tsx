import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const { dayMeals, totals, goals, weeklyCalories, macroKcal } = useNutritionAnalytics(date);

  const canGoForward = date < todayStr();

  const shiftDate = (delta: number) => {
    const d = addDays(parseISO(date), delta);
    const newDate = format(d, 'yyyy-MM-dd');
    if (newDate <= todayStr()) setDate(newDate);
  };

  return (
    <div>
      <TopBar title="Nutrition Log" subtitle="Calorie & macro tracking" />

      <div className="p-6 space-y-6">
        {/* Date selector */}
        <div className="flex items-center gap-3">
          <button onClick={() => shiftDate(-1)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={() => shiftDate(1)} disabled={!canGoForward}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={16} />
          </button>
          <span className="text-sm text-gray-500">{formatDate(date, 'EEEE, MMMM d')}</span>
          {date !== todayStr() && (
            <button onClick={() => setDate(todayStr())} className="text-xs text-blue-500 hover:underline">
              Jump to today
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Add Meal</h2>
            <MealEntryForm date={date} />
          </div>

          {/* Macro bars */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Today's Macros</h2>
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

          {/* Pie chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Macro Split</h2>
            <MacroPieChart
              proteinKcal={macroKcal.protein}
              carbsKcal={macroKcal.carbs}
              fatKcal={macroKcal.fat}
              totalKcal={totals.calories}
            />
          </div>
        </div>

        {/* Meal table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Meals — {formatDate(date)}
          </h2>
          <NutritionTable meals={dayMeals} />
        </div>

        {/* Weekly calorie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Last 7 Days</h2>
          <WeeklyCalorieChart data={weeklyCalories} />
        </div>
      </div>
    </div>
  );
}
