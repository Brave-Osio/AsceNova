/** Mirrors the web app's src/lib/queryKeys.ts — same keys, same shape. */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  profile: {
    detail: (userId: string) => ['profile', userId] as const,
  },
  plan: {
    active: (userId: string) => ['plan', 'active', userId] as const,
  },
  logs: {
    list: (userId: string) => ['logs', userId] as const,
  },
  progress: {
    detail: (userId: string) => ['progress', userId] as const,
  },
  leaderboard: {
    list: () => ['leaderboard'] as const,
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
  challenges: {
    catalog: () => ['challenges', 'catalog'] as const,
    mine: (userId: string) => ['challenges', 'mine', userId] as const,
  },
} as const;
