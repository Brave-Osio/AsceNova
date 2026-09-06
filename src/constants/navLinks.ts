import { ROUTES } from './routes';

export interface NavLink {
  label: string;
  to: string;
  icon: string;
  /** Only shown once real auth exists (Phase 1+); undefined today means "always visible". */
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

/**
 * Single source of truth for primary navigation — previously duplicated
 * independently between Navbar.tsx and MobileDrawer.tsx.
 */
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', to: ROUTES.landing, icon: '🏠' },
  { label: 'Profile', to: ROUTES.setup, icon: '👤' },
  { label: 'Plan', to: ROUTES.plan, icon: '📋' },
  { label: 'Dashboard', to: ROUTES.dashboard, icon: '📊' },
  { label: 'Daily Log', to: ROUTES.log, icon: '📝' },
  { label: 'Leaderboard', to: ROUTES.leaderboard, icon: '🏆' },
  { label: 'Coach', to: ROUTES.coach, icon: '🤖' },
];
