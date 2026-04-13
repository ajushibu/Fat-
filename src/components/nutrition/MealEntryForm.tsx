import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAppStore } from '../../store';
import { todayStr } from '../../utils/dateUtils';
import { COMMON_FOODS } from '../../data/commonFoods';
import type { MealType } from '../../types';
import toast from 'react-hot-toast';

interface MealEntryFormProps {
  date?: string;
  onSuccess?: () => void;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function MealEntryForm({ date: propDate, onSuccess }: MealEntryFormProps) {
  const addMeal = useAppStore((s) => s.addMeal);
  const [date, setDate] = useState(propDate ?? todayStr());
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [serving, setServing] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredFoods = search.length > 1
    ? COMMON_FOODS.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  const fillFromFood = (food: typeof COMMON_FOODS[0]) => {
    setName(food.name);
    setCalories(String(Math.round(food.calories * food.servingMultiplier)));
    setProtein(String(Math.round(food.protein * food.servingMultiplier * 10) / 10));
    setCarbs(String(Math.round(food.carbs * food.servingMultiplier * 10) / 10));
    setFat(String(Math.round(food.fat * food.servingMultiplier * 10) / 10));
    setServing(food.defaultServing);
    setShowSearch(false);
    setSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Enter a meal name.'); return; }
    if (!calories || isNaN(+calories)) { toast.error('Enter valid calories.'); return; }

    addMeal({
      date,
      mealType,
      name: name.trim(),
      calories: +calories,
      protein: +(protein || 0),
      carbs: +(carbs || 0),
      fat: +(fat || 0),
      fiber: null,
      servingSize: serving.trim() || null,
    });

    toast.success('Meal logged!');
    setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setServing('');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayStr()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Meal</label>
          <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
            {MEAL_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Food search */}
      <div className="relative">
        <label className="block text-xs font-medium text-gray-600 mb-1">Food Name</label>
        <div className="flex gap-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Chicken breast, rice..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button type="button" onClick={() => setShowSearch(!showSearch)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-400">
            {showSearch ? <X size={14} /> : <Search size={14} />}
          </button>
        </div>
        {showSearch && (
          <div className="mt-2 space-y-2">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods..." autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {filteredFoods.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {filteredFoods.map((food) => (
                  <button key={food.name} type="button" onClick={() => fillFromFood(food)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-gray-100 last:border-0">
                    <span className="font-medium">{food.name}</span>
                    <span className="ml-2 text-gray-400">{Math.round(food.calories * food.servingMultiplier)} kcal · {food.defaultServing}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Macros */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Calories (kcal)', key: 'calories', val: calories, set: setCalories, placeholder: '500' },
          { label: 'Protein (g)', key: 'protein', val: protein, set: setProtein, placeholder: '30' },
          { label: 'Carbs (g)', key: 'carbs', val: carbs, set: setCarbs, placeholder: '50' },
          { label: 'Fat (g)', key: 'fat', val: fat, set: setFat, placeholder: '15' },
        ].map(({ label, key, val, set, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input type="number" step="0.1" min="0" value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Serving Size (optional)</label>
        <input type="text" value={serving} onChange={(e) => setServing(e.target.value)} placeholder="200g, 1 cup..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      <button type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">
        Log Meal
      </button>
    </form>
  );
}
