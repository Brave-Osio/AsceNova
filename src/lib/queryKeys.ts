/**
 * Single source of truth for TanStack Query keys, mirroring the same
 * "one constants object, never inline strings" convention already used
 * by src/constants/routes.ts.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  profile: {
    detail: (userId: string) => ['profile', userId] as const,
  },
  plan: {
    active: (userId: string) => ['plan', 'active', userId] as const,
    history: (userId: string) => ['plan', 'history', userId] as const,
  },
  nutrition: {
    active: (userId: string) => ['nutrition', 'active', userId] as const,
    mealSuggestions: (category?: string, mealType?: string) =>
      ['nutrition', 'meal-suggestions', category ?? null, mealType ?? null] as const,
  },
  logs: {
    list: (userId: string, range?: string) => ['logs', userId, range ?? null] as const,
    byDate: (userId: string, date: string) => ['logs', userId, date] as const,
  },
  progress: {
    detail: (userId: string) => ['progress', userId] as const,
    xpHistory: (userId: string) => ['progress', 'xp-history', userId] as const,
    rankHistory: (userId: string) => ['progress', 'rank-history', userId] as const,
  },
  achievements: {
    list: (userId: string) => ['achievements', userId] as const,
  },
  leaderboard: {
    list: () => ['leaderboard'] as const,
    me: (userId: string) => ['leaderboard', 'me', userId] as const,
  },
  coach: {
    history: (userId: string) => ['coach', 'history', userId] as const,
  },
  goals: {
    list: (userId: string) => ['goals', userId] as const,
  },
  notifications: {
    list: (userId: string) => ['notifications', userId] as const,
    unreadCount: (userId: string) => ['notifications', 'unread-count', userId] as const,
  },
  admin: {
    stats: () => ['admin', 'stats'] as const,
    users: (filters: Record<string, unknown>) => ['admin', 'users', filters] as const,
    userDetail: (id: string) => ['admin', 'user', id] as const,
  },
} as const;
