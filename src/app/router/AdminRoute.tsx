import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import RouteSuspenseFallback from './RouteSuspenseFallback';

export default function AdminRoute() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  if (isLoading) {
    return <RouteSuspenseFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
