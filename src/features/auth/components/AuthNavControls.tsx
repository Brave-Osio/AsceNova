import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routes';

interface AuthNavControlsProps {
  /** Mobile drawer passes its own close handler so tapping either action also closes the menu. */
  onNavigate?: () => void;
}

/**
 * Self-contained like NotificationBell — checks its own auth state so
 * Navbar/MobileDrawer don't need to branch on it themselves.
 */
export default function AuthNavControls({ onNavigate }: AuthNavControlsProps) {
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => {
          logout();
          onNavigate?.();
        }}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
      >
        Log Out
      </button>
    );
  }

  return (
    <Link
      to={ROUTES.login}
      onClick={onNavigate}
      className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-300 transition-colors hover:bg-violet-500/20"
    >
      Log In
    </Link>
  );
}
