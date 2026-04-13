import { TopBar } from '../components/layout/TopBar';
import { GoalForm } from '../components/goals/GoalForm';
import { GoalProgressBar } from '../components/goals/GoalProgressBar';
import { ProjectionChart } from '../components/goals/ProjectionChart';
import { MilestoneTimeline } from '../components/goals/MilestoneTimeline';
import { EmptyState } from '../components/shared/EmptyState';
import { useGoals, useAppStore } from '../store';
import { useWeightAnalytics } from '../hooks/useWeightAnalytics';
import { formatDate } from '../utils/dateUtils';

export function Goals() {
  const goals = useGoals();
  const getGoalProgress = useAppStore((s) => s.getGoalProgress);
  const { latest, projectedGoalDate, projectionData } = useWeightAnalytics();

  const progress = getGoalProgress(latest?.weight ?? null);

  return (
    <div>
      <TopBar title="Goals" subtitle="Set your target weight and track milestones" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goal form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Your Goals</h2>
            <GoalForm />
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
            <h2 className="text-sm font-semibold text-gray-700">Progress</h2>

            {goals.targetWeight && goals.startWeight && latest ? (
              <>
                <GoalProgressBar
                  startWeight={goals.startWeight}
                  currentWeight={latest.weight}
                  targetWeight={goals.targetWeight}
                />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="text-lg font-bold text-emerald-600">{progress.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Projected Goal Date</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {projectedGoalDate ? formatDate(projectedGoalDate) : 'Not enough data'}
                    </p>
                  </div>
                  {goals.startDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Started</p>
                      <p className="text-sm font-semibold text-gray-700">{formatDate(goals.startDate)}</p>
                    </div>
                  )}
                  {goals.targetDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Target Date</p>
                      <p className="text-sm font-semibold text-gray-700">{formatDate(goals.targetDate)}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon="🎯"
                title="No goal set"
                description="Set a target weight to track your progress."
              />
            )}
          </div>
        </div>

        {/* Projection chart */}
        {projectionData.length > 0 && goals.targetWeight && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Projection</h2>
            <ProjectionChart data={projectionData} targetWeight={goals.targetWeight} />
            <p className="mt-2 text-xs text-gray-400">
              Dashed line shows projected weight based on your current trend. Actual results vary.
            </p>
          </div>
        )}

        {/* Milestones */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Milestones</h2>
          <MilestoneTimeline />
        </div>
      </div>
    </div>
  );
}
