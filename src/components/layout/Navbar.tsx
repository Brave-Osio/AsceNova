import { NavLink } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { NAV_LINKS } from '../../constants/navLinks';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import AuthNavControls from '../../features/auth/components/AuthNavControls';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

/**
 * Navbar is purely presentational: renders the logo/links/bell/auth row.
 * Full link set on desktop (>=768px) — on mobile, primary navigation
 * moves to BottomTabBar, whose "More" tab replaces the old hamburger
 * drawer entry point.
 */
export default function Navbar() {
  const { isAdmin } = useAuth();
  const visibleLinks = NAV_LINKS.filter((link) => !link.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <NavLink to={ROUTES.landing} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/15 text-brand-primary-light">
            <Zap size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-tight text-brand-text">AsceNova</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-primary/15 text-brand-primary-light'
                    : 'text-brand-text-secondary hover:text-brand-text hover:bg-brand-card'
                }`
              }
            >
              <link.icon size={14} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <AuthNavControls />
        </div>
      </div>
    </header>
  );
}
