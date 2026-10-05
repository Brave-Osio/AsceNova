import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { createGoal, completeGoal, abandonGoal } from '../../../services/goalService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast, showSuccessToast } from '../../../lib/toast';
import type { CreateGoalInput } from '../../../types/goal.types';

/** Mirrors the web app's useGoalActions.ts — manual-async pattern with per-action loading state. */
export function useGoalActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [pendingGoalId, setPendingGoalId] = useState<string | null>(null);
  const inFlight = useRef(false);

  function invalidate() {
    if (user) {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.list(user.id) });
    }
  }

  async function create(input: CreateGoalInput): Promise<boolean> {
    setIsCreating(true);
    try {
      await createGoal(input);
      invalidate();
      showSuccessToast('Goal created!');
      return true;
    } catch (err) {
      showErrorToast(err);
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function complete(goalId: string) {
    if (inFlight.current) return;
    inFlight.current = true;
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
      inFlight.current = false;
    }
  }

  async function abandon(goalId: string): Promise<boolean> {
    if (inFlight.current) return false;
    inFlight.current = true;
    setPendingGoalId(goalId);
    try {
      await abandonGoal(goalId);
      invalidate();
      showSuccessToast('Goal abandoned');
      return true;
    } catch (err) {
      showErrorToast(err);
      return false;
    } finally {
      setPendingGoalId(null);
      inFlight.current = false;
    }
  }

  return { create, complete, abandon, isCreating, pendingGoalId };
}
