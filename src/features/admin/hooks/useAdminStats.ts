import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';

export function useAdminStats() {
  const query = useQuery({ queryKey: queryKeys.admin.stats(), queryFn: getAdminStats });
  return { stats: query.data, isLoading: query.isLoading };
}
