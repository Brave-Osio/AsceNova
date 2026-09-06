import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { showSuccessToast } from '../../../lib/toast';
import { ROUTES } from '../../../constants/routes';
import type { RegisterFormValues } from '../schemas';

export function useRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: RegisterFormValues) =>
      register({ email: values.email, password: values.password, fullName: values.fullName }),
    onSuccess: () => {
      showSuccessToast('Account created — welcome to AsceNova!');
      navigate(ROUTES.setup, { replace: true });
    },
  });
}
