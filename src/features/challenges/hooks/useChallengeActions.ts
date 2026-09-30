import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { createChallenge, respondToChallengeInvite } from '../../../services/challengeService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast, showSuccessToast } from '../../../lib/toast';

/** Hand-rolled manual-async pattern (mirrors useDailyLog.ts) — needs per-action loading state. */
export function useChallengeActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);

  function invalidate() {
    if (user) {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.mine(user.id) });
    }
  }

  async function create(challengeId: string, inviteeUsernames: string[]): Promise<boolean> {
    setIsCreating(true);
    try {
      await createChallenge({ challengeId, inviteeUsernames });
      invalidate();
      showSuccessToast('Challenge created!');
      return true;
    } catch (err) {
      showErrorToast(err);
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function respond(inviteId: string, accept: boolean) {
    setPendingInviteId(inviteId);
    try {
      await respondToChallengeInvite(inviteId, accept);
      invalidate();
      showSuccessToast(accept ? 'Challenge joined!' : 'Invite declined');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setPendingInviteId(null);
    }
  }

  return { create, respond, isCreating, pendingInviteId };
}
