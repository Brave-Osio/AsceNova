import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getProgress } from '../../../services/progressService';
import { queryKeys } from '../../../lib/queryKeys';
import { getRankForXp, getNextRankThreshold, getRankProgress } from '../../../engines/rankEngine';
import { DEFAULT_PROGRESS } from '../../../types/gamification.types';

/**
 * Read-only — replaces UserProgressContext. Mutations (applying a daily
 * log's XP/streak/achievement effects, or Simulate's bulk replay) go
 * through progressService directly from the hooks that trigger them
 * (useDailyLog, useSimulateProgress), which seed this query's cache on
 * success — same split as useProfile (read) vs useProfileForm (write).
 */
export function useUserProgress() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.progress.detail(user?.id ?? ''),
    queryFn: getProgress,
    enabled: !!user?.id,
  });

  const progress = query.data ?? DEFAULT_PROGRESS;

  return {
    progress,
    unlockedAchievementIds: progress.unlockedAchievementIds,
    rank: getRankForXp(progress.totalXp),
    nextRankThreshold: getNextRankThreshold(progress.totalXp),
    rankProgress: getRankProgress(progress.totalXp),
    isLoading: query.isLoading,
  };
}
