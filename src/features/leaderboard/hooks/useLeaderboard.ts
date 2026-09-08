import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getLeaderboard } from '../../../services/leaderboardService';
import { queryKeys } from '../../../lib/queryKeys';
import type { LeaderboardRowData } from '../../../services/leaderboardService';

export type { LeaderboardRowData };

/**
 * Plain read hook — the backend already computes position, rank, and
 * isCurrentUser server-side (it knows the requesting user's id), so
 * there's no client-side merging/sorting left to do here.
 */
export function useLeaderboard() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.leaderboard.list(),
    queryFn: getLeaderboard,
    enabled: !!user?.id,
  });

  return { rows: query.data ?? [], isLoading: query.isLoading };
}
