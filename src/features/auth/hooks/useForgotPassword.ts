import { useMutation } from '@tanstack/react-query';
import { forgotPasswordRequest } from '../../../services/authService';
import type { ForgotPasswordFormValues } from '../schemas';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => forgotPasswordRequest(values),
  });
}
