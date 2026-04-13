import { Trophy } from 'lucide-react';
import { useMilestones } from '../../store';
import { formatDate } from '../../utils/dateUtils';
import { EmptyState } from '../shared/EmptyState';

export function MilestoneTimeline() {
  const milestones = useMilestones();

  if (milestones.length === 0) {
    return (
      <EmptyState
        icon="🏆"
        title="No milestones yet"
        description="Keep logging to unlock achievements!"
      />
    );
  }

  const sorted = [...milestones].sort((a, b) => b.achievedAt.localeCompare(a.achievedAt));

  return (
    <div className="space-y-3">
      {sorted.map((m) => (
        <div key={m.id} className="flex items-start gap-3">
          <div className="mt-0.5 w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <Trophy size={14} className="text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">{m.label}</p>
            <p className="text-xs text-gray-400">{formatDate(m.achievedAt.split('T')[0])}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
