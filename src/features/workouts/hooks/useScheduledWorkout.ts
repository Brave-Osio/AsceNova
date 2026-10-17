import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { completeWorkout, getWorkoutForDate } from '../../../services/workoutService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast, showSuccessToast } from '../../../lib/toast';
import { fireConfetti } from '../../../lib/confetti';
import { getRankForXp } from '../../../engines/rankEngine';
import type { UserProgress } from '../../../types/gamification.types';
import type { WorkoutForDate } from '../../../types/workout.types';

/** The workout the user's existing plan schedules for `date` (read-only — opening the page never generates a plan). */
export function useWorkoutForDate(date: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.workoutDay.byDate(user?.id ?? '', date),
    queryFn: () => getWorkoutForDate(date),
    enabled: !!user?.id,
  });
}

/**
 * "Mark as Done". The button is disabled while the request is in flight (mutation.isPending) and the
 * backend is idempotent per (user, workout day, date), so repeated clicks, retries and concurrent
 * tabs can never double-count. The UI only flips to "completed" after the server confirms.
 */
export function useCompleteWorkout(date: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutDayId: string) => completeWorkout(workoutDayId, date),
    onSuccess: (result) => {
      if (!user) return;

      const previousXp = queryClient.getQueryData<UserProgress>(queryKeys.progress.detail(user.id))?.totalXp ?? 0;

      queryClient.setQueryData<WorkoutForDate>(queryKeys.workoutDay.byDate(user.id, date), (prev) =>
        prev ? { ...prev, completed: true, completedAt: prev.completedAt ?? new Date().toISOString() } : prev,
      );
      queryClient.setQueryData(queryKeys.progress.detail(user.id), result.progress);

      // Everything that derives from today's daily progress, XP, streak or challenges.
      queryClient.invalidateQueries({ queryKey: ['logs', user.id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.mine(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.list() });

      if (getRankForXp(previousXp) !== getRankForXp(result.progress.totalXp) || result.newAchievementTitles.length > 0) {
        fireConfetti();
      }

      showSuccessToast(
        result.alreadyCompleted
          ? 'This workout was already marked as done.'
          : result.xpGained > 0
            ? `Workout complete! +${result.xpGained} XP`
            : 'Workout complete!',
      );
    },
    onError: (err) => showErrorToast(err),
  });
}
