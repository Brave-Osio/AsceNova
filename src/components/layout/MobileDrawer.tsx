import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS: { label: string; to: string; icon: string }[] = [
  { label: 'Home',        to: ROUTES.landing,     icon: '🏠' },
  { label: 'Profile',     to: ROUTES.setup,        icon: '👤' },
  { label: 'Fitness Plan',to: ROUTES.plan,         icon: '📋' },
  { label: 'Dashboard',   to: ROUTES.dashboard,    icon: '📊' },
  { label: 'Daily Log',   to: ROUTES.log,          icon: '📝' },
  { label: 'Leaderboard', to: ROUTES.leaderboard,  icon: '🏆' },
  { label: 'Coach',       to: ROUTES.coach,        icon: '🤖' },
];

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer panel */}
      <nav
        className={`absolute right-0 top-0 h-full w-72 border-l border-white/8 bg-[var(--color-brand-surface)] shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 p-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Asce<span className="text-gradient-violet">Nova</span></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Links */}
        <ul className="flex flex-col gap-1 p-4">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`
                }
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
