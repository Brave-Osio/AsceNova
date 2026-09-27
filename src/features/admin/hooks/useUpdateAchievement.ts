import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminAchievement } from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast, showSuccessToast } from '../../../lib/toast';
import type { UpdateAchievementInput } from '../../../types/admin.types';

export function useUpdateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAchievementInput }) => updateAdminAchievement(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.achievements() });
      showSuccessToast('Achievement updated');
    },
    onError: (err) => showErrorToast(err),
  });
}
