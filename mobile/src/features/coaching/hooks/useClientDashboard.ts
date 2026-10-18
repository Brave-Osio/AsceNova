import { useQuery } from '@tanstack/react-query';
import { getClientDashboard } from '../../../services/coachingService';
import { queryKeys } from '../../../lib/queryKeys';

/** Mirrors the web app's useClientDashboard.ts. */
export function useClientDashboard(clientId: string) {
  const query = useQuery({
    queryKey: queryKeys.coaching.dashboard(clientId),
    queryFn: () => getClientDashboard(clientId),
    enabled: !!clientId,
    retry: false,
    // Every fetch is written to the audit log, so don't refetch more often than needed.
    staleTime: 60_000,
  });
  return { dashboard: query.data, isLoading: query.isLoading, isError: query.isError };
}
