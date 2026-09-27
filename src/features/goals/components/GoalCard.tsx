import Button from '../../../components/ui/Button';
import { useGoalActions } from '../hooks/useGoalActions';
import type { Goal } from '../../../types/goal.types';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  COMPLETED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  ABANDONED: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
};

export default function GoalCard({ goal }: { goal: Goal }) {
  const { complete, abandon, pendingGoalId } = useGoalActions();
  const isPending = pendingGoalId === goal.id;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-bold text-white">{GOAL_LABEL[goal.goalType] ?? goal.goalType}</span>
          {goal.targetValue != null && <span className="ml-2 text-sm text-gray-400">Target: {goal.targetValue}kg</span>}
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[goal.status]}`}>
          {goal.status}
        </span>
      </div>

      {goal.targetDate && (
        <p className="mt-2 text-xs text-gray-500">By {new Date(goal.targetDate).toLocaleDateString()}</p>
      )}
      {goal.progressNote && <p className="mt-2 text-sm text-gray-400">{goal.progressNote}</p>}

      {goal.status === 'ACTIVE' && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" loading={isPending} onClick={() => complete(goal.id)}>
            Mark Complete
          </Button>
          <Button size="sm" variant="ghost" loading={isPending} onClick={() => abandon(goal.id)}>
            Abandon
          </Button>
        </div>
      )}
    </div>
  );
}
