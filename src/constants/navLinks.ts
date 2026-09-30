import type { LucideIcon } from 'lucide-react';
import {
  Home,
  User,
  ClipboardList,
  LayoutDashboard,
  NotebookPen,
  Trophy,
  Swords,
  Target,
  Bot,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavLink {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Hidden from the public (logged-out) nav — these all point at ProtectedRoute pages. */
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

/**
 * Single source of truth for primary navigation — used by the sidebar
 * (desktop + mobile drawer) and, for logged-out visitors, the top Navbar
 * (public links only).
 */
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', to: ROUTES.landing, icon: Home },
  { label: 'Profile', to: ROUTES.setup, icon: User, requiresAuth: true },
  { label: 'Plan', to: ROUTES.plan, icon: ClipboardList, requiresAuth: true },
  { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard, requiresAuth: true },
  { label: 'Daily Log', to: ROUTES.log, icon: NotebookPen, requiresAuth: true },
  { label: 'Leaderboard', to: ROUTES.leaderboard, icon: Trophy, requiresAuth: true },
  { label: 'Challenges', to: ROUTES.challenges, icon: Swords, requiresAuth: true },
  { label: 'Goals', to: ROUTES.goals, icon: Target, requiresAuth: true },
  { label: 'Coach', to: ROUTES.coach, icon: Bot, requiresAuth: true },
  { label: 'Settings', to: ROUTES.settings, icon: Settings, requiresAuth: true },
  { label: 'Admin', to: ROUTES.admin, icon: ShieldCheck, requiresAuth: true, adminOnly: true },
];
