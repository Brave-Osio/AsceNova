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
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  admin: '/admin',
  adminAuditLogs: '/admin/audit-logs',
  settings: '/settings',
  challenges: '/challenges',
  terms: '/terms',
  goals: '/goals',
  coach: '/coach',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/** Read-only dashboard of one client, opened from the coach tab. */
export function coachClientPath(clientId: string): string {
  return `/coach/clients/${clientId}`;
}

/** No other route in this app is id-based yet, so this stays a standalone helper rather than a ROUTES entry. */
export function adminUserDetailPath(userId: string): string {
  return `/admin/users/${userId}`;
}
