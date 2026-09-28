import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileDrawer from './MobileDrawer';
import BottomTabBar from './BottomTabBar';
import { useAuth } from '../../context/AuthContext';

/**
 * Layout is the single place that composes navigation chrome around
 * every routed page. Pages themselves stay free of nav concerns —
 * this is what makes pages/* components thin.
 */
export default function Layout() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-svh flex-col bg-brand-bg">
      <Navbar />
      <MobileDrawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
      <main className={`flex-1 ${isAuthenticated ? 'pb-20 md:pb-0' : ''}`}>
        <Outlet />
      </main>
      <BottomTabBar isMoreOpen={isMoreOpen} onMoreToggle={() => setIsMoreOpen((open) => !open)} />
    </div>
  );
}
