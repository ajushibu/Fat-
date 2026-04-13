import { TopBar } from '../components/layout/TopBar';
import { GoalForm } from '../components/goals/GoalForm';
import { ProjectionChart } from '../components/goals/ProjectionChart';
import { MilestoneTimeline } from '../components/goals/MilestoneTimeline';
import { useGoals, useAppStore } from '../store';
import { useWeightAnalytics } from '../hooks/useWeightAnalytics';
import { formatDate } from '../utils/dateUtils';

export function Goals() {
  const goals = useGoals();
  const getGoalProgress = useAppStore((s) => s.getGoalProgress);
  const { latest, projectedGoalDate, projectionData } = useWeightAnalytics();

  const progress = getGoalProgress(latest?.weight ?? null);

  return (
    <div className="min-h-full">
      <TopBar title="Goals" />

      <div className="px-4 md:px-6 py-4 space-y-4 max-w-2xl md:max-w-none mx-auto">

        {/* Progress banner */}
        {goals.targetWeight && goals.startWeight && latest && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-emerald-100">Goal Weight</p>
                <p className="text-3xl font-bold">{goals.targetWeight} <span className="text-base font-normal text-emerald-200">lbs</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-emerald-100">Progress</p>
                <p className="text-3xl font-bold">{progress.toFixed(0)}<span className="text-base font-normal text-emerald-200">%</span></p>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-emerald-200">
              <span>Start: {goals.startWeight} lbs</span>
              {projectedGoalDate && <span>Est: {formatDate(projectedGoalDate, 'MMM d, yyyy')}</span>}
            </div>
          </div>
        )}

        {/* Goal form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Set Goals</h2>
          <GoalForm />
        </div>

        {/* Projection chart */}
        {projectionData.length > 1 && goals.targetWeight && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Projection</h2>
            <p className="text-xs text-gray-400 mb-3">Dashed line = projected at current rate</p>
            <ProjectionChart data={projectionData} targetWeight={goals.targetWeight} />
          </div>
        )}

        {/* Milestones */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Milestones</h2>
          <MilestoneTimeline />
        </div>
      </div>
    </div>
  );
}
