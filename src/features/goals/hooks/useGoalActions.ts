import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { createGoal, completeGoal, abandonGoal } from '../../../services/goalService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast, showSuccessToast } from '../../../lib/toast';
import type { CreateGoalInput } from '../../../types/goal.types';

/** Hand-rolled manual-async pattern (mirrors useChallengeActions.ts) — per-action loading state. */
export function useGoalActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [pendingGoalId, setPendingGoalId] = useState<string | null>(null);

  function invalidate() {
    if (user) {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(user.id) });
    }
  }

  async function create(input: CreateGoalInput) {
    setIsCreating(true);
    try {
      await createGoal(input);
      invalidate();
      showSuccessToast('Goal created!');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsCreating(false);
    }
  }

  async function complete(goalId: string) {
    setPendingGoalId(goalId);
    try {
      await completeGoal(goalId);
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.progress.detail(user.id) });
      }
      invalidate();
      showSuccessToast('Goal completed! +100 XP');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setPendingGoalId(null);
    }
  }

  async function abandon(goalId: string) {
    setPendingGoalId(goalId);
    try {
      await abandonGoal(goalId);
      invalidate();
      showSuccessToast('Goal abandoned');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setPendingGoalId(null);
    }
  }

  return { create, complete, abandon, isCreating, pendingGoalId };
}
