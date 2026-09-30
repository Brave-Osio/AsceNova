import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routes';

interface AuthNavControlsProps {
  /** Mobile drawer passes its own close handler so tapping either action also closes the menu. */
  onNavigate?: () => void;
}

/**
 * Self-contained like NotificationBell — checks its own auth state so
 * Navbar/Sidebar don't need to branch on it themselves.
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
        className="rounded-full px-3 py-1.5 text-xs font-medium text-brand-text-secondary transition-colors hover:bg-brand-card hover:text-brand-text"
      >
        Log Out
      </button>
    );
  }

  return (
    <Link
      to={ROUTES.login}
      onClick={onNavigate}
      className="rounded-full bg-brand-card-alt px-3 py-1.5 text-xs font-bold text-brand-primary-light transition-colors hover:bg-brand-card"
    >
      Log In
    </Link>
  );
}
