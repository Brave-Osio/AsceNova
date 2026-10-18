import { useQuery } from '@tanstack/react-query';
import { getClientDashboard } from '../../../services/coachingService';
import { queryKeys } from '../../../lib/queryKeys';

export function useClientDashboard(clientId: string) {
  const query = useQuery({
    queryKey: queryKeys.coaching.dashboard(clientId),
    queryFn: () => getClientDashboard(clientId),
    enabled: !!clientId,
    retry: false,
    // Every fetch is written to the audit log, so don't refetch just because the tab regained focus.
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  return { dashboard: query.data, isLoading: query.isLoading, isError: query.isError };
}
