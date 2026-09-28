import { NavLink, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { PRIMARY_TAB_LINKS, MORE_TAB_LINKS } from '../../constants/navLinks';
import { useAuth } from '../../context/AuthContext';

interface BottomTabBarProps {
  isMoreOpen: boolean;
  onMoreToggle: () => void;
}

/**
 * Mobile-only (<768px) bottom tab bar — the primary navigation surface on
 * small screens, replacing the old hamburger-only pattern. Desktop keeps
 * the full link set in Navbar instead (see docs in navLinks.ts for why
 * only 4 destinations live here). Only rendered once authenticated, since
 * every primary tab points at a protected route.
 */
export default function BottomTabBar({ isMoreOpen, onMoreToggle }: BottomTabBarProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const isMoreActive =
    isMoreOpen || MORE_TAB_LINKS.some((link) => location.pathname.startsWith(link.to) && link.to !== '/');

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-brand-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {PRIMARY_TAB_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex min-w-[3.5rem] flex-col items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                isActive ? 'tab-active' : 'text-brand-text-muted'
              }`
            }
          >
            <link.icon size={20} />
            {link.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onMoreToggle}
          className={`flex min-w-[3.5rem] flex-col items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors ${
            isMoreActive ? 'tab-active' : 'text-brand-text-muted'
          }`}
        >
          <MoreHorizontal size={20} />
          More
        </button>
      </div>
    </nav>
  );
}
