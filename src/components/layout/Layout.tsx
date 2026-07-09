import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileDrawer from './MobileDrawer';

/**
 * Layout is the single place that composes navigation chrome around
 * every routed page. Pages themselves stay free of nav concerns —
 * this is what makes pages/* components thin.
 */
export default function Layout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col bg-mesh">
      <Navbar onMenuToggle={() => setIsDrawerOpen(true)} />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
