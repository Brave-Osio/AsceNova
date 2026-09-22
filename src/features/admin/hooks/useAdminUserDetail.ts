import { useQuery } from '@tanstack/react-query';
import { getAdminUserDetail } from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';

export function useAdminUserDetail(userId: string) {
  const query = useQuery({
    queryKey: queryKeys.admin.userDetail(userId),
    queryFn: () => getAdminUserDetail(userId),
    enabled: !!userId,
  });
  return { detail: query.data, isLoading: query.isLoading };
}
