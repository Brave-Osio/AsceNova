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

interface RawLeaderboardRow {
  position: number;
  name: string;
  /** The backend's Prisma `RankName` enum is UPPERCASE (e.g. "IRON") — the
   * frontend's RankName type/RANK_ICON/RANK_COLOR_CLASS maps use Title Case
   * ("Iron"), so the raw value has to be normalized before it's used as a
   * lookup key anywhere in the UI. */
  rank: string;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
}

function normalizeRank(rawRank: string): RankName {
  const titleCase = (rawRank.charAt(0).toUpperCase() + rawRank.slice(1).toLowerCase()) as RankName;
  return titleCase;
}

/**
 * Wraps the leaderboard API and normalizes the backend's rank casing to
 * match the frontend's RankName shape (see normalizeRank above) — this is
 * the "API-shape-to-domain-shape mapping" this file is for.
 */
export async function getLeaderboard(): Promise<LeaderboardRowData[]> {
  const res = await httpClient.get<{ rows: RawLeaderboardRow[] }>('/api/leaderboard');
  return res.data.rows.map((row) => ({ ...row, rank: normalizeRank(row.rank) }));
}
