import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { showSuccessToast } from '../../../lib/toast';
import { ROUTES } from '../../../constants/routes';
import type { LoginFormValues } from '../schemas';

interface LocationState {
  from?: Location;
}

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (values: LoginFormValues) => login(values),
    onSuccess: () => {
      showSuccessToast('Welcome back!');
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname ?? ROUTES.dashboard, { replace: true });
    },
  });
}
