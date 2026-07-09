import { daysBetween } from '../utils/dateUtils';
import type { UserProgress } from '../types/gamification.types';

/**
 * Given current progress and the date of a new log entry, returns
 * updated progress with currentStreak/longestStreak/lastLogDate
 * recalculated. Pure function — no storage, no Date.now() side effects
 * beyond what's passed in via newLogDate.
 *
 * Three cases, based on days elapsed since lastLogDate:
 * - 0 days (same day): already logged today, streak unchanged.
 *   (UI layer decides whether to allow/block a same-day re-log.)
 * - 1 day: streak continues, increments by 1.
 * - >1 day, or lastLogDate is null (first-ever log): streak resets to 1.
 */
export function calculateStreak(progress: UserProgress, newLogDate: string): UserProgress {
  if (progress.lastLogDate === null) {
    return {
      ...progress,
      currentStreak: 1,
      longestStreak: Math.max(1, progress.longestStreak),
      lastLogDate: newLogDate,
    };
  }

  const gap = daysBetween(progress.lastLogDate, newLogDate);

  if (gap === 0) {
    // Same day — no change to streak count, just keep lastLogDate as-is.
    return progress;
  }

  if (gap === 1) {
    const nextStreak = progress.currentStreak + 1;
    return {
      ...progress,
      currentStreak: nextStreak,
      longestStreak: Math.max(nextStreak, progress.longestStreak),
      lastLogDate: newLogDate,
    };
  }

  // gap > 1 (or negative, e.g. clock skew) — treat as a broken streak, restart at 1.
  return {
    ...progress,
    currentStreak: 1,
    longestStreak: Math.max(1, progress.longestStreak),
    lastLogDate: newLogDate,
  };
}

/** True if the gap since lastLogDate is more than 1 day — used by UI to show a "streak at risk" warning. */
export function isStreakBroken(progress: UserProgress, asOfDate: string): boolean {
  if (progress.lastLogDate === null) return false;
  return daysBetween(progress.lastLogDate, asOfDate) > 1;
}
