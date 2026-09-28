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
  /** Only shown once real auth exists (Phase 1+); undefined today means "always visible". */
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

/**
 * Single source of truth for primary navigation — used by the desktop
 * top navbar (all links) and the "More" sheet on mobile (everything
 * not in PRIMARY_TAB_LINKS below).
 */
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', to: ROUTES.landing, icon: Home },
  { label: 'Profile', to: ROUTES.setup, icon: User },
  { label: 'Plan', to: ROUTES.plan, icon: ClipboardList },
  { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Daily Log', to: ROUTES.log, icon: NotebookPen },
  { label: 'Leaderboard', to: ROUTES.leaderboard, icon: Trophy },
  { label: 'Challenges', to: ROUTES.challenges, icon: Swords },
  { label: 'Goals', to: ROUTES.goals, icon: Target },
  { label: 'Coach', to: ROUTES.coach, icon: Bot },
  { label: 'Settings', to: ROUTES.settings, icon: Settings },
  { label: 'Admin', to: ROUTES.admin, icon: ShieldCheck, adminOnly: true },
];

/**
 * The mobile bottom tab bar only has room for a handful of destinations
 * (see reference UI kit pattern). These are the 4 highest-frequency
 * authenticated screens; everything else in NAV_LINKS surfaces in the
 * "More" tab instead.
 */
export const PRIMARY_TAB_LABELS = ['Dashboard', 'Plan', 'Daily Log', 'Coach'];

export const PRIMARY_TAB_LINKS = NAV_LINKS.filter((link) => PRIMARY_TAB_LABELS.includes(link.label));

export const MORE_TAB_LINKS = NAV_LINKS.filter((link) => !PRIMARY_TAB_LABELS.includes(link.label));
