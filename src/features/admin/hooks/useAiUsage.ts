import { useQuery } from '@tanstack/react-query';
import { getAiUsage } from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';

/** Polls every minute so the gauge stays roughly live while an admin keeps the page open. */
export function useAiUsage() {
  const query = useQuery({ queryKey: queryKeys.admin.aiUsage(), queryFn: getAiUsage, refetchInterval: 60_000 });
  return { usage: query.data, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}
