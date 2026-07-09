import { RANK_THRESHOLDS, type RankThreshold } from '../constants/ranks';
import type { RankName } from '../types/gamification.types';

/**
 * Returns the highest rank whose minXp is <= totalXp.
 *
 * Boundary rule: a user with EXACTLY 500 XP is Bronze, not Iron —
 * thresholds are inclusive lower bounds. RANK_THRESHOLDS is ordered
 * ascending, so we walk from the end backward and take the first
 * match; this avoids needing to special-case the final (highest) rank.
 */
export function getRankForXp(totalXp: number): RankName {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= RANK_THRESHOLDS[i].minXp) {
      return RANK_THRESHOLDS[i].name;
    }
  }
  // Defensive fallback — unreachable in practice since Iron's minXp is 0
  // and totalXp is never negative, but keeps the function total.
  return RANK_THRESHOLDS[0].name;
}

/**
 * Returns the threshold for the rank directly above the current one,
 * or null if the user is already at the highest rank (Radiant).
 */
export function getNextRankThreshold(totalXp: number): RankThreshold | null {
  const currentRank = getRankForXp(totalXp);
  const currentIndex = RANK_THRESHOLDS.findIndex((r) => r.name === currentRank);
  const next = RANK_THRESHOLDS[currentIndex + 1];
  return next ?? null;
}

/**
 * Returns a 0-1 fraction representing progress toward the next rank,
 * for progress-bar UI. Returns 1 (maxed out) at Radiant.
 */
export function getRankProgress(totalXp: number): number {
  const currentRank = getRankForXp(totalXp);
  const currentThreshold = RANK_THRESHOLDS.find((r) => r.name === currentRank)!;
  const nextThreshold = getNextRankThreshold(totalXp);

  if (!nextThreshold) return 1;

  const span = nextThreshold.minXp - currentThreshold.minXp;
  const progressIntoSpan = totalXp - currentThreshold.minXp;
  return progressIntoSpan / span;
}
