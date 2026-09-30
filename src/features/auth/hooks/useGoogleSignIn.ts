import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { showSuccessToast } from '../../../lib/toast';
import { ROUTES } from '../../../constants/routes';

interface LocationState {
  from?: Location;
}

/** Mirrors useLogin/useRegister: a brand-new Google account goes to profile setup, like register does. */
export function useGoogleSignIn() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (idToken: string) => loginWithGoogle({ idToken, rememberMe: true }),
    onSuccess: ({ isNewUser }) => {
      if (isNewUser) {
        showSuccessToast('Account created — welcome to AsceNova!');
        navigate(ROUTES.setup, { replace: true });
        return;
      }
      showSuccessToast('Welcome back!');
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname ?? ROUTES.dashboard, { replace: true });
    },
  });
}
