import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { listLogs } from '../../../services/logService';
import { queryKeys } from '../../../lib/queryKeys';

/** Mirrors the web app's useLogs.ts. */
export function useLogs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.logs.list(user?.id ?? ''),
    queryFn: listLogs,
    enabled: !!user?.id,
  });
}
