import type { RankName } from '../types/gamification.types';

export interface RankThreshold {
  name: RankName;
  minXp: number;
}

/**
 * Ordered lowest to highest. rankEngine relies on this exact ordering
 * to find "current rank" and "next rank" by array position — keep it sorted.
 */
export const RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'Iron', minXp: 0 },
  { name: 'Bronze', minXp: 500 },
  { name: 'Silver', minXp: 1500 },
  { name: 'Gold', minXp: 3000 },
  { name: 'Platinum', minXp: 5000 },
  { name: 'Diamond', minXp: 8000 },
  { name: 'Ascendant', minXp: 12000 },
  { name: 'Immortal', minXp: 18000 },
  { name: 'Radiant', minXp: 25000 },
];
