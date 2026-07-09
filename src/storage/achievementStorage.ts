import { getItem, setItem } from './localStorageClient';
import { STORAGE_KEYS } from '../constants/storageKeys';

/**
 * Stores only the list of unlocked achievement IDs — not the full
 * AchievementDefinition objects. Definitions (title, description, icon)
 * are static data living in constants/achievements.ts, so we never
 * persist duplicate copies of content that doesn't change per user.
 */
export function saveAchievements(unlockedIds: string[]): void {
  setItem(STORAGE_KEYS.achievements, unlockedIds);
}

export function getAchievements(): string[] {
  return getItem<string[]>(STORAGE_KEYS.achievements) ?? [];
}

/** Adds a single achievement id if not already present; returns the updated list. */
export function unlockAchievement(achievementId: string): string[] {
  const current = getAchievements();
  if (current.includes(achievementId)) return current;
  const updated = [...current, achievementId];
  saveAchievements(updated);
  return updated;
}
