import { useQuery } from '@tanstack/react-query';
import { getAdminAchievements } from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';

export function useAdminAchievements() {
  const query = useQuery({ queryKey: queryKeys.admin.achievements(), queryFn: getAdminAchievements });
  return { achievements: query.data ?? [], isLoading: query.isLoading };
}
