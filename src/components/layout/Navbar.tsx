import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { NAV_LINKS } from '../../constants/navLinks';
import NotificationBell from '../../features/notifications/components/NotificationBell';

interface NavbarProps {
  onMenuToggle: () => void;
}

/**
 * Navbar is purely presentational: renders links and reports menu-toggle.
 */
export default function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40">
      {/* Blurred glass bar */}
      <div className="border-b border-white/5 bg-[var(--color-brand-bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <NavLink
            to={ROUTES.landing}
            className="flex items-center gap-2 group"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 border border-violet-500/30 group-hover:bg-violet-600/30 transition-colors">
              <span className="text-base leading-none">⚡</span>
              <div className="absolute inset-0 rounded-lg bg-violet-500/10 blur-sm group-hover:bg-violet-500/20 transition-all" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Asce<span className="text-gradient-violet">Nova</span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-600/15 text-violet-300 nav-active'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`
                }
              >
                <span className="text-xs">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell />

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors md:hidden"
              aria-label="Open menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 3h14v1.5H1zm0 4.25h14v1.5H1zm0 4.25h14v1.5H1z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
