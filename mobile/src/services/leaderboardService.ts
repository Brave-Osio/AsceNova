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

/** Mirrors the web app's src/services/leaderboardService.ts. */
export async function getLeaderboard(): Promise<LeaderboardRowData[]> {
  const res = await httpClient.get<{ rows: LeaderboardRowData[] }>('/api/leaderboard');
  return res.data.rows;
}
