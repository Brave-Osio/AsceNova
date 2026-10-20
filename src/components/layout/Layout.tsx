import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';
import BrandLogo from '../ui/BrandLogo';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import CoachPanel from '../../features/coach-chat/components/CoachPanel';
import { CoachPanelProvider } from '../../features/coach-chat/CoachPanelContext';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';

const COLLAPSED_KEY = 'sidebar-collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Layout is the single place that composes navigation chrome around
 * every routed page. Logged-in users get the collapsible Sidebar, a floating
 * collapse toggle at the top-left of the page content, a slim mobile top bar,
 * and the floating AI coach panel. Logged-out visitors get the
 * public top Navbar, so no authenticated destinations are ever offered to them.
 */
export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(readCollapsed);
  const { isAuthenticated } = useAuth();

  function toggleCollapsed() {
    setIsCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // Storage unavailable: the preference just won't persist.
      }
      return next;
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh flex-col bg-brand-bg">
        <Navbar />
        <main className="flex-1 md:pt-10">
          <Outlet />
        </main>
        <footer className="border-t border-brand-border px-4 py-6 text-center text-xs text-brand-text-muted">
          <Link to={ROUTES.terms} className="font-medium hover:text-brand-text hover:underline">
            Terms and Conditions
          </Link>
        </footer>
      </div>
    );
  }

  return (
    <CoachPanelProvider>
      <div className="flex min-h-svh bg-brand-bg">
        <Sidebar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />
        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* Below md: slim top bar with the menu button that opens the drawer. */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-brand-border bg-brand-bg px-4 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-text-secondary transition-colors hover:bg-brand-card-alt hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 active:scale-95"
            >
              <Menu size={18} />
            </button>
            <NavLink
              to={ROUTES.landing}
              aria-label="ASCENOVA home"
              className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
            >
              <BrandLogo size={28} />
              <span className="text-sm font-bold tracking-tight text-brand-text">ASCENOVA</span>
            </NavLink>
          </header>

          {/* md+: the collapse toggle floats at the top-left of the page content. It is a zero-height
              sticky wrapper inside the content column, so it follows the sidebar's edge as the sidebar
              resizes, stays visible while scrolling, and adds no layout height. */}
          <div className="sticky top-2 z-30 hidden h-0 md:block">
            <div className="pl-3">
              <SidebarToggle isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
            </div>
          </div>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        {/* Pinned beside the AI coach launcher (CoachPanel's fixed top-right button, 44px wide). */}
        <div className="fixed right-16 top-2.5 z-40 sm:right-[4.25rem] sm:top-3">
          <NotificationBell />
        </div>
        <CoachPanel />
      </div>
    </CoachPanelProvider>
  );
}
