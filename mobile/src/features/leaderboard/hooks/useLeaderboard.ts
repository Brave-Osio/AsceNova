import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../../../services/leaderboardService';
import { queryKeys } from '../../../lib/queryKeys';

/** Mirrors the web app's useLeaderboard.ts. */
export function useLeaderboard() {
  const query = useQuery({ queryKey: queryKeys.leaderboard.list(), queryFn: getLeaderboard });
  return { rows: query.data ?? [], isLoading: query.isLoading };
}
