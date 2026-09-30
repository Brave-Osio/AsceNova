import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Zap } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
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
 * every routed page. Logged-in users get the collapsible Sidebar (plus a
 * slim mobile top bar); logged-out visitors get the public top Navbar, so
 * no authenticated destinations are ever offered to them.
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
        // Storage unavailable — the preference just won't persist.
      }
      return next;
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh flex-col bg-brand-bg">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh bg-brand-bg">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapsed={toggleCollapsed}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-brand-border bg-brand-bg px-4 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-card text-brand-text-secondary transition-colors hover:bg-brand-card-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/15 text-brand-primary-light">
              <Zap size={14} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-tight text-brand-text">AsceNova</span>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
