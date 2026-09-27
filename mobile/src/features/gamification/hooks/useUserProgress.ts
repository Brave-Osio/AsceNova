import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getProgress } from '../../../services/progressService';
import { queryKeys } from '../../../lib/queryKeys';
import { getRankForXp, getNextRankThreshold, getRankProgress } from '../../../engines/rankEngine';
import { DEFAULT_PROGRESS } from '../../../types/gamification.types';

/** Mirrors the web app's useUserProgress.ts. */
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
