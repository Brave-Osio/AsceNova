import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { listLogs } from '../../../services/logService';
import { queryKeys } from '../../../lib/queryKeys';

/** Backend-persisted log history, for consumers like the dashboard's weight trend chart. */
export function useLogs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.logs.list(user?.id ?? ''),
    queryFn: listLogs,
    enabled: !!user?.id,
  });
}
