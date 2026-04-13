import { TopBar } from '../components/layout/TopBar';
import { StatCard } from '../components/shared/StatCard';
import { WeightEntryForm } from '../components/weight/WeightEntryForm';
import { WeightChart } from '../components/weight/WeightChart';
import { WeightTable } from '../components/weight/WeightTable';
import { useWeightAnalytics } from '../hooks/useWeightAnalytics';
import { useSettings } from '../store';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export function WeightTracker() {
  const { latest, trend, bmi, bmiCategory, minWeight, maxWeight, avgWeight, totalLost, chartData } = useWeightAnalytics();
  const settings = useSettings();
  const unit = settings.weightUnit;

  const trendStr =
    trend.direction === 'losing' ? `${Math.abs(trend.ratePerWeek)} ${unit}/wk loss` :
    trend.direction === 'gaining' ? `${trend.ratePerWeek} ${unit}/wk gain` :
    'Stable';

  return (
    <div>
      <TopBar title="Weight Tracker" subtitle="Daily weigh-ins, trends & analytics" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard label="Current" value={latest?.weight ?? '—'} unit={unit} />
          <StatCard label="Min (all time)" value={minWeight ?? '—'} unit={unit} color="green" />
          <StatCard label="Max (all time)" value={maxWeight ?? '—'} unit={unit} />
          <StatCard label="Average" value={avgWeight ?? '—'} unit={unit} />
          <StatCard label="Total Lost" value={totalLost !== null && totalLost > 0 ? totalLost : '—'} unit={unit} color={totalLost !== null && totalLost > 0 ? 'green' : 'default'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Trend</h2>
            <div className="flex items-center gap-2">
              {trend.direction === 'losing' ? (
                <TrendingDown size={20} className="text-emerald-500" />
              ) : trend.direction === 'gaining' ? (
                <TrendingUp size={20} className="text-red-500" />
              ) : (
                <Minus size={20} className="text-gray-400" />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800">{trendStr}</p>
                <p className="text-xs text-gray-400">based on last 30 entries</p>
              </div>
            </div>

            {settings.showBMI && bmi && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">BMI</p>
                <p className="text-xl font-bold text-gray-800">{bmi}</p>
                <p className="text-xs text-gray-400">{bmiCategory}</p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Log Weight</h3>
              <WeightEntryForm compact />
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weight Trend</h2>
            <WeightChart data={chartData} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Weight Log</h2>
          <WeightTable />
        </div>
      </div>
    </div>
  );
}
