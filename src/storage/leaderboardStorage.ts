import type { LeaderboardEntry } from '../types/leaderboard.types';

/**
 * MVP leaderboard is static mock data, not actually read from
 * localStorage — there's no real multi-user backend yet. It lives in
 * storage/ rather than services/ because its eventual replacement is a
 * GET /api/leaderboard call, i.e. a data-fetch concern, not an AI/external
 * service call. The function signature below is exactly what callers
 * will use once that's real, so this swap requires zero changes upstream.
 */
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { position: 1, name: 'Maria', rank: 'Radiant', xp: 25420, streak: 87 },
  { position: 2, name: 'Alex', rank: 'Immortal', xp: 21850, streak: 65 },
  { position: 3, name: 'John', rank: 'Ascendant', xp: 18300, streak: 42 },
  { position: 4, name: 'Priya', rank: 'Diamond', xp: 9120, streak: 31 },
  { position: 5, name: 'Sam', rank: 'Platinum', xp: 5600, streak: 18 },
];

export function getLeaderboard(): LeaderboardEntry[] {
  return MOCK_LEADERBOARD;
}
