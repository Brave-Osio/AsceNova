import type { LucideIcon } from 'lucide-react';
import {
  Home,
  ClipboardList,
  LayoutDashboard,
  NotebookPen,
  Trophy,
  Swords,
  Target,
  Settings,
  Users,
  BarChart3,
  UserCog,
  Award,
  ScrollText,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavLink {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Hidden from the public (logged-out) nav — these all point at ProtectedRoute pages. */
  requiresAuth?: boolean;
  adminOnly?: boolean;
  /** Visible to coaches and admins. */
  coachOnly?: boolean;
  /** Rendered under the sidebar's separate "Admin" heading instead of the main list. */
  adminSection?: boolean;
}

/**
 * Single source of truth for primary navigation — used by the sidebar
 * (desktop + mobile drawer) and, for logged-out visitors, the top Navbar
 * (public links only).
 */
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', to: ROUTES.landing, icon: Home },
  { label: 'Plan', to: ROUTES.plan, icon: ClipboardList, requiresAuth: true },
  { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard, requiresAuth: true },
  { label: 'Daily Log', to: ROUTES.log, icon: NotebookPen, requiresAuth: true },
  { label: 'Leaderboard', to: ROUTES.leaderboard, icon: Trophy, requiresAuth: true },
  { label: 'Challenges', to: ROUTES.challenges, icon: Swords, requiresAuth: true },
  { label: 'Goals', to: ROUTES.goals, icon: Target, requiresAuth: true },
  { label: 'Settings', to: ROUTES.settings, icon: Settings, requiresAuth: true },
  { label: 'Coach', to: ROUTES.coach, icon: Users, requiresAuth: true, coachOnly: true },
  { label: 'Analytics', to: ROUTES.admin, icon: BarChart3, requiresAuth: true, adminOnly: true, adminSection: true },
  { label: 'Users', to: ROUTES.adminUsers, icon: UserCog, requiresAuth: true, adminOnly: true, adminSection: true },
  { label: 'Achievements', to: ROUTES.adminAchievements, icon: Award, requiresAuth: true, adminOnly: true, adminSection: true },
  { label: 'Audit Logs', to: ROUTES.adminAuditLogs, icon: ScrollText, requiresAuth: true, adminOnly: true, adminSection: true },
];
