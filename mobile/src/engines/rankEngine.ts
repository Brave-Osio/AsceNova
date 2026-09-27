import { RANK_THRESHOLDS, type RankThreshold } from '../constants/ranks';
import type { RankName } from '../types/gamification.types';

/** Mirrors the web app's src/engines/rankEngine.ts exactly. */
export function getRankForXp(totalXp: number): RankName {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= RANK_THRESHOLDS[i].minXp) {
      return RANK_THRESHOLDS[i].name;
    }
  }
  return RANK_THRESHOLDS[0].name;
}

export function getNextRankThreshold(totalXp: number): RankThreshold | null {
  const currentRank = getRankForXp(totalXp);
  const currentIndex = RANK_THRESHOLDS.findIndex((r) => r.name === currentRank);
  const next = RANK_THRESHOLDS[currentIndex + 1];
  return next ?? null;
}

export function getRankProgress(totalXp: number): number {
  const currentRank = getRankForXp(totalXp);
  const currentThreshold = RANK_THRESHOLDS.find((r) => r.name === currentRank)!;
  const nextThreshold = getNextRankThreshold(totalXp);

  if (!nextThreshold) return 1;

  const span = nextThreshold.minXp - currentThreshold.minXp;
  const progressIntoSpan = totalXp - currentThreshold.minXp;
  return progressIntoSpan / span;
}
