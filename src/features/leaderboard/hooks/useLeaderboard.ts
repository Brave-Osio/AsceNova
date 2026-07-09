import { useEffect, useState } from 'react';
import { getLeaderboard } from '../../../storage/leaderboardStorage';
import { getProfile } from '../../../storage/profileStorage';
import { useUserProgress } from '../../../context/UserProgressContext';
import type { LeaderboardEntry } from '../../../types/leaderboard.types';

export interface LeaderboardRowData extends LeaderboardEntry {
  isCurrentUser: boolean;
}

/**
 * Merges the static mock leaderboard with the real signed-in user's
 * progress (if a profile exists), re-sorts by XP, and re-numbers
 * positions. This is what makes the Leaderboard feel connected to the
 * rest of the app rather than a disconnected static page — your own
 * Simulate Progress / Daily Log actions visibly move your position here.
 */
export function useLeaderboard(): LeaderboardRowData[] {
  const { progress, rank } = useUserProgress();
  const [rows, setRows] = useState<LeaderboardRowData[]>([]);

  useEffect(() => {
    const mockEntries = getLeaderboard();
    const profile = getProfile();

    const allEntries: LeaderboardRowData[] = mockEntries.map((entry) => ({
      ...entry,
      isCurrentUser: false,
    }));

    if (profile) {
      allEntries.push({
        position: 0, // recalculated below
        name: `${profile.name} (You)`,
        rank,
        xp: progress.totalXp,
        streak: progress.currentStreak,
        isCurrentUser: true,
      });
    }

    const sorted = allEntries
      .sort((a, b) => b.xp - a.xp)
      .map((entry, index) => ({ ...entry, position: index + 1 }));

    setRows(sorted);
    // Re-run whenever progress changes so the table reflects live XP/rank/streak.
  }, [progress, rank]);

  return rows;
}
