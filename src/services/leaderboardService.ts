import { httpClient } from '../lib/httpClient';
import type { RankName } from '../types/gamification.types';

export interface LeaderboardRowData {
  position: number;
  name: string;
  rank: RankName;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
}

/**
 * Thin wrapper over the leaderboard API — no shape adaptation needed,
 * the backend already returns rows in exactly the shape the UI renders.
 */
export async function getLeaderboard(): Promise<LeaderboardRowData[]> {
  const res = await httpClient.get<{ rows: LeaderboardRowData[] }>('/api/leaderboard');
  return res.data.rows;
}
