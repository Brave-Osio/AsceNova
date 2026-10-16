import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { NAV_LINKS } from '../../constants/navLinks';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import { useProfile } from '../../features/profile/hooks/useProfile';
import ThemeToggle from '../ui/ThemeToggle';
import BrandLogo from '../ui/BrandLogo';
import Tooltip from '../ui/Tooltip';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Bottom-of-sidebar account block: avatar + name, links to the unified Profile and Settings page. */
function AccountLink({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const displayName = profile?.fullName?.trim() || user?.email || 'Your account';

  return (
    <Tooltip label={displayName} disabled={!collapsed}>
      <NavLink
        to={ROUTES.settings}
        onClick={onNavigate}
        aria-label={collapsed ? `${displayName}, profile and settings` : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl py-2 transition-colors ${FOCUS_RING} ${
            collapsed ? 'w-10 justify-center px-0' : 'w-full px-2'
          } ${isActive ? 'bg-brand-primary/15' : 'hover:bg-brand-card-alt'}`
        }
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-bold text-brand-primary-light"
        >
          {initialsOf(displayName)}
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-brand-text">{displayName}</span>
            <span className="block truncate text-xs text-brand-text-muted">Profile and settings</span>
          </span>
        )}
      </NavLink>
    </Tooltip>
  );
}

function SidebarContent({ collapsed, onNavigate, onClose }: SidebarContentProps) {
  const { isAdmin, logout } = useAuth();
  const links = NAV_LINKS.filter((link) => !link.adminOnly || isAdmin);

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 flex-shrink-0 items-center ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
        <NavLink to={ROUTES.landing} onClick={onNavigate} className={`flex items-center gap-2.5 rounded-lg ${FOCUS_RING}`} aria-label="ASCENOVA home">
          <BrandLogo size={32} />
          {!collapsed && <span className="text-sm font-bold tracking-tight text-brand-text">ASCENOVA</span>}
        </NavLink>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-brand-card-alt text-brand-text-muted transition-colors hover:text-brand-text ${FOCUS_RING}`}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {links.map((link) => (
          <Tooltip key={link.to} label={link.label} disabled={!collapsed}>
            <NavLink
              to={link.to}
              end={link.to === ROUTES.landing}
              onClick={onNavigate}
              aria-label={collapsed ? link.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors ${FOCUS_RING} ${
                  collapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  isActive
                    ? 'bg-brand-primary/15 text-brand-primary-light'
                    : 'text-brand-text-secondary hover:bg-brand-card-alt hover:text-brand-text'
                }`
              }
            >
              <link.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* Footer hierarchy: theme + notifications, then account, then logout. */}
      <div className={`flex flex-shrink-0 flex-col gap-2 border-t border-brand-border p-2 ${collapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : 'px-1'}`}>
          <ThemeToggle />
          <NotificationBell placement="side" />
        </div>
        <AccountLink collapsed={collapsed} onNavigate={onNavigate} />
        <Tooltip label="Log Out" disabled={!collapsed}>
          <button
            type="button"
            onClick={() => {
              logout();
              onNavigate?.();
            }}
            aria-label="Log Out"
            className={`flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-brand-text-secondary transition-colors hover:bg-brand-card-alt hover:text-brand-text ${FOCUS_RING} ${
              collapsed ? 'w-10 justify-center px-0' : 'w-full px-3'
            }`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && 'Log Out'}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

/**
 * Authenticated navigation. On md+ it is a sticky, collapsible rail (icons
 * only when collapsed, icons + labels when expanded). Below md the same
 * content renders as an off-canvas drawer opened from the mobile top bar.
 *
 * The collapse control is not in here: it is SidebarToggle, a floating
 * button at the top-left of the page content that rides along the sidebar's edge.
 */
export default function Sidebar({ isCollapsed, isMobileOpen, onMobileClose }: SidebarProps) {
  useEffect(() => {
    if (!isMobileOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onMobileClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isMobileOpen, onMobileClose]);

  return (
    <>
      <aside
        className={`sticky top-0 z-30 hidden h-svh flex-shrink-0 border-r border-brand-border bg-brand-surface transition-[width] duration-200 md:block ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      <div className={`fixed inset-0 z-50 md:hidden ${isMobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isMobileOpen}>
        <div
          onClick={onMobileClose}
          className={`absolute inset-0 bg-black/60 transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-64 max-w-[85vw] border-r border-brand-border bg-brand-surface transition-transform duration-300 ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent collapsed={false} onNavigate={onMobileClose} onClose={onMobileClose} />
        </aside>
      </div>
    </>
  );
}
