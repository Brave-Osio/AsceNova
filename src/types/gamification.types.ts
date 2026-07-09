export type RankName =
  | 'Iron'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Ascendant'
  | 'Immortal'
  | 'Radiant';

export interface UserProgress {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null; // ISO date (YYYY-MM-DD) — used to calculate streak continuity
  unlockedAchievementIds: string[];
}

/** The zero-state for a brand-new user — never persisted until first action. */
export const DEFAULT_PROGRESS: UserProgress = {
  totalXp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastLogDate: null,
  unlockedAchievementIds: [],
};

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or icon identifier, kept as data not markup
}

export interface XpGainEvent {
  amount: number;
  reason: string; // e.g. "Daily Check-In", "Workout Completed"
}
