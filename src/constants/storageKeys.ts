/**
 * Centralized localStorage key names.
 *
 * Every storage/*.ts file reads its key from here instead of inlining
 * a string. This is the single place that needs to change if keys
 * are ever namespaced (e.g. prefixed with a user id after auth lands).
 */
export const STORAGE_KEYS = {
  logs: 'afa:logs',
  achievements: 'afa:achievements',
  progress: 'afa:progress',
  leaderboard: 'afa:leaderboard',
} as const;
