import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meRequest, setRecoveryEmailRequest } from '../../../services/authService';
import { queryKeys } from '../../../lib/queryKeys';
import { showSuccessToast } from '../../../lib/toast';
import type { RecoveryEmailFormValues } from '../schemas';

/**
 * Mirrors the web app's useRecoveryEmail.ts. The masked recovery Gmail only comes from
 * /me (the login response doesn't carry it), so it is read through React Query rather
 * than the AuthContext user.
 */
export function useRecoveryEmail() {
  const queryClient = useQueryClient();

  const meQuery = useQuery({ queryKey: queryKeys.auth.me, queryFn: meRequest });

  const save = useMutation({
    mutationFn: (values: RecoveryEmailFormValues) => setRecoveryEmailRequest(values),
    onSuccess: () => {
      showSuccessToast('Recovery Gmail saved!');
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });

  return {
    maskedEmail: meQuery.data?.user.recoveryEmailMasked ?? null,
    isLoading: meQuery.isLoading,
    save,
  };
}
