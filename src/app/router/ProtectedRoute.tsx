import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import RouteSuspenseFallback from './RouteSuspenseFallback';

/**
 * Reverses the Phase-1 "no route guards, demo build" decision that
 * routes.tsx originally documented — real auth now exists, so protected
 * routes actually gate on it.
 */
export default function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteSuspenseFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
