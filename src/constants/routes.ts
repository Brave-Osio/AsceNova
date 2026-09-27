/**
 * Centralized route path constants.
 *
 * Why this file exists: every <Link>, navigate() call, and route
 * definition references these constants instead of hardcoded strings.
 * If a path ever changes, it changes in exactly one place.
 */
export const ROUTES = {
  landing: '/',
  setup: '/setup',
  plan: '/plan',
  dashboard: '/dashboard',
  log: '/log',
  leaderboard: '/leaderboard',
  coach: '/coach',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  admin: '/admin',
  settings: '/settings',
  challenges: '/challenges',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/** No other route in this app is id-based yet, so this stays a standalone helper rather than a ROUTES entry. */
export function adminUserDetailPath(userId: string): string {
  return `/admin/users/${userId}`;
}
