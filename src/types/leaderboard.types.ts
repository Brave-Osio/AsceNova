import type { RankName } from './gamification.types';

export interface LeaderboardEntry {
  position: number;
  name: string;
  rank: RankName;
  xp: number;
  streak: number;
}
