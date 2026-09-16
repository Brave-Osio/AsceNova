import { prisma } from '../lib/prismaClient.js';

export interface LeaderboardRow {
  position: number;
  name: string;
  rank: string;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
}

/**
 * Live query, not a precomputed snapshot — UserProgress/Profile are
 * already the real, kept-up-to-date source of truth (Gamification's
 * applyDailyLog updates UserProgress on every log), so there's no
 * separate cache to keep in sync or risk drifting. The unused Prisma
 * LeaderboardEntry model stays modeled-but-unused, same as
 * WorkoutExercise was left unpopulated for a while in the Plan domain.
 */
export async function getLeaderboard(requestingUserId: string): Promise<LeaderboardRow[]> {
  const rows = await prisma.userProgress.findMany({
    orderBy: { totalXp: 'desc' },
    include: { user: { include: { profile: true } } },
  });

  return rows
    .filter((row) => row.user.profile !== null)
    .map((row, index) => ({
      position: index + 1,
      name: row.user.profile!.fullName,
      rank: row.cachedRank,
      xp: row.totalXp,
      streak: row.currentStreak,
      isCurrentUser: row.userId === requestingUserId,
    }));
}
