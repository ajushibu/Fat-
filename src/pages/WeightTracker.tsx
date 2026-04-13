import { useState } from 'react';
import { TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { StatCard } from '../components/shared/StatCard';
import { WeightEntryForm } from '../components/weight/WeightEntryForm';
import { WeightChart } from '../components/weight/WeightChart';
import { WeightTable } from '../components/weight/WeightTable';
import { useWeightAnalytics } from '../hooks/useWeightAnalytics';
import { useSettings } from '../store';

export function WeightTracker() {
  const { latest, trend, bmi, bmiCategory, minWeight, maxWeight, totalLost, chartData } = useWeightAnalytics();
  const settings = useSettings();
  const unit = settings.weightUnit;
  const [showForm, setShowForm] = useState(false);

  const trendLabel =
    trend.direction === 'losing' ? `−${Math.abs(trend.ratePerWeek)} ${unit}/wk` :
    trend.direction === 'gaining' ? `+${trend.ratePerWeek} ${unit}/wk` : 'Stable';

  return (
    <div className="min-h-full">
      <TopBar
        title="Weight"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Log {showForm ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        }
      />

      <div className="px-4 md:px-6 py-4 space-y-4 max-w-2xl md:max-w-none mx-auto">

        {/* Collapsible form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Log Weight</h2>
            <WeightEntryForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Current" value={latest?.weight ?? '—'} unit={unit} />
          <StatCard
            label="Total Lost"
            value={totalLost !== null && totalLost > 0 ? totalLost : '—'}
            unit={totalLost !== null && totalLost > 0 ? unit : ''}
            color={totalLost !== null && totalLost > 0 ? 'green' : 'default'}
          />
          <StatCard label="Min" value={minWeight ?? '—'} unit={unit} color="green" />
          <StatCard label="Max" value={maxWeight ?? '—'} unit={unit} />
        </div>

        {/* Trend + BMI */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              trend.direction === 'losing' ? 'bg-emerald-50' :
              trend.direction === 'gaining' ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              {trend.direction === 'losing' ? <TrendingDown size={18} className="text-emerald-500" /> :
               trend.direction === 'gaining' ? <TrendingUp size={18} className="text-red-400" /> :
               <Minus size={18} className="text-gray-400" />}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Trend</p>
              <p className="text-sm font-bold text-gray-800">{trendLabel}</p>
            </div>
          </div>
          {bmi && settings.showBMI && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">BMI</p>
              <p className="text-xl font-bold text-gray-800">{bmi}</p>
              <p className="text-xs text-gray-400">{bmiCategory}</p>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Trend Chart</h2>
          <WeightChart data={chartData} />
        </div>

        {/* Log table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Weight Log</h2>
          <WeightTable />
        </div>
      </div>
    </div>
  );
}
