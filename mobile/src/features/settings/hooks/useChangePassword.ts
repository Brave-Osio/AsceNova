import { useMutation } from '@tanstack/react-query';
import { changePasswordRequest } from '../../../services/authService';
import { showSuccessToast } from '../../../lib/toast';
import type { ChangePasswordFormValues } from '../schemas';

/** Mirrors the web app's useChangePassword.ts. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePasswordRequest({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => showSuccessToast('Password changed!'),
  });
}
