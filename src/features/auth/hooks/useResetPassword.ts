import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { resetPasswordRequest } from '../../../services/authService';
import { showSuccessToast } from '../../../lib/toast';
import { ROUTES } from '../../../constants/routes';
import type { ResetPasswordFormValues } from '../schemas';

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPasswordRequest({ token: values.token, newPassword: values.newPassword }),
    onSuccess: () => {
      showSuccessToast('Password reset — please log in.');
      navigate(ROUTES.login, { replace: true });
    },
  });
}
