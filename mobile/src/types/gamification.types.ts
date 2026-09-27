/** Mirrors the web app's src/types/gamification.types.ts. */
export type RankName = 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Ascendant' | 'Immortal' | 'Radiant';

export interface UserProgress {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  unlockedAchievementIds: string[];
}

export const DEFAULT_PROGRESS: UserProgress = {
  totalXp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastLogDate: null,
  unlockedAchievementIds: [],
};
