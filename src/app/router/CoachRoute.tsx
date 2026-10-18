import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import RouteSuspenseFallback from './RouteSuspenseFallback';

/** Coaches and admins only. Hiding the tab is cosmetic — /api/coach/* enforces the role and client scope server-side. */
export default function CoachRoute() {
  const { isLoading, isAuthenticated, canCoach } = useAuth();

  if (isLoading) {
    return <RouteSuspenseFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!canCoach) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
