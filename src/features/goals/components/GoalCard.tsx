import { useState } from 'react';
import Button from '../../../components/ui/Button';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { useGoalActions } from '../hooks/useGoalActions';
import type { Goal } from '../../../types/goal.types';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'chip-primary',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300 light:text-emerald-700',
  ABANDONED: 'bg-brand-card-alt text-brand-text-muted',
};

/** After this many abandon clicks on one goal, the confirm modal adds a stronger warning. */
const REPEAT_WARNING_THRESHOLD = 10;

export default function GoalCard({ goal }: { goal: Goal }) {
  const { complete, abandon, pendingGoalId } = useGoalActions();
  const isPending = pendingGoalId === goal.id;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [attempts, setAttempts] = useState(0);

  function handleAbandonClick() {
    setAttempts((n) => n + 1);
    setIsConfirmOpen(true);
  }

  async function handleConfirm() {
    const ok = await abandon(goal.id);
    if (ok) setIsConfirmOpen(false);
  }

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-bold text-brand-text">{GOAL_LABEL[goal.goalType] ?? goal.goalType}</span>
          {goal.targetValue != null && <span className="ml-2 text-sm text-brand-text-secondary">Target: {goal.targetValue}kg</span>}
        </div>
        <span className={`chip px-2 py-0.5 text-xs ${STATUS_BADGE[goal.status]}`}>
          {goal.status}
        </span>
      </div>

      {goal.targetDate && (
        <p className="mt-2 text-xs text-brand-text-muted">By {new Date(goal.targetDate).toLocaleDateString()}</p>
      )}
      {goal.progressNote && <p className="mt-2 text-sm text-brand-text-secondary">{goal.progressNote}</p>}

      {goal.status === 'ACTIVE' && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" loading={isPending} onClick={() => complete(goal.id)}>
            Mark Complete
          </Button>
          <Button size="sm" variant="ghost" disabled={isPending} onClick={handleAbandonClick}>
            Abandon
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Abandon this goal?"
        description="It will be marked as abandoned and moved out of your active goals. This can't be undone."
        warning={attempts >= REPEAT_WARNING_THRESHOLD ? `You've tried to abandon this goal ${attempts} times — please confirm only if you're sure.` : undefined}
        confirmLabel="Yes, abandon"
        cancelLabel="Keep goal"
        isLoading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
