import { NavLink } from 'react-router-dom';
import { X, Zap } from 'lucide-react';
import { MORE_TAB_LINKS } from '../../constants/navLinks';
import { useAuth } from '../../context/AuthContext';
import AuthNavControls from '../../features/auth/components/AuthNavControls';
import ThemeToggle from '../ui/ThemeToggle';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The mobile "More" sheet — opened from BottomTabBar's More tab. Lists
 * every nav destination that doesn't fit in the 4-item bottom bar
 * (see MORE_TAB_LINKS in constants/navLinks.ts).
 */
export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { isAdmin } = useAuth();
  const visibleLinks = MORE_TAB_LINKS.filter((link) => !link.adminOnly || isAdmin);

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Sheet panel */}
      <nav
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-brand-border bg-brand-surface pb-24 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border p-5">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-primary-light" />
            <span className="text-sm font-bold text-brand-text">More</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-card text-brand-text-muted hover:text-brand-text transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Links */}
        <ul className="grid grid-cols-3 gap-2 p-4">
          {visibleLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-2 rounded-2xl px-2 py-4 text-center text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-primary/15 text-brand-primary-light'
                      : 'bg-brand-card text-brand-text-secondary hover:text-brand-text'
                  }`
                }
              >
                <link.icon size={20} />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="border-t border-brand-border p-4">
          <ThemeToggle variant="row" />
        </div>

        <div className="border-t border-brand-border p-4">
          <AuthNavControls onNavigate={onClose} />
        </div>
      </nav>
    </div>
  );
}
