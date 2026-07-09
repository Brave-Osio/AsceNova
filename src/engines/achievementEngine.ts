import { getRankForXp } from './rankEngine';
import type { UserProgress } from '../types/gamification.types';
import type { DailyLogEntry } from '../types/log.types';

/**
 * Each rule is a pure predicate: given current progress + log history,
 * does this achievement's condition hold? Centralizing rules as small
 * named functions (rather than one giant if/else) keeps each one easy
 * to test and easy to add to without touching the others.
 */
const ACHIEVEMENT_RULES: Record<string, (progress: UserProgress, logs: DailyLogEntry[]) => boolean> = {
  first_workout: (_progress, logs) => logs.some((log) => log.habits.workoutCompleted),
  first_week_completed: (_progress, logs) => logs.length >= 7,
  seven_day_streak: (progress) => progress.currentStreak >= 7,
  thirty_day_streak: (progress) => progress.currentStreak >= 30,
  bronze_promotion: (progress) => getRankForXp(progress.totalXp) !== 'Iron',
  silver_promotion: (progress) =>
    ['Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'].includes(
      getRankForXp(progress.totalXp),
    ),
  gold_promotion: (progress) =>
    ['Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'].includes(
      getRankForXp(progress.totalXp),
    ),
  consistency_master: (_progress, logs) => logs.length >= 50,
  discipline_champion: (progress) => progress.currentStreak >= 100,
};

/**
 * Evaluates all achievement rules and returns the ids that are newly
 * unlocked (i.e. condition holds now, but id wasn't already in
 * progress.unlockedAchievementIds). Callers persist these via
 * achievementStorage.unlockAchievement() and typically award bonus XP
 * for each new unlock (see XP_EVENTS.achievementUnlock in xpEngine).
 */
export function evaluateAchievements(
  progress: UserProgress,
  logs: DailyLogEntry[],
): string[] {
  const newlyUnlocked: string[] = [];

  for (const [id, rule] of Object.entries(ACHIEVEMENT_RULES)) {
    const alreadyUnlocked = progress.unlockedAchievementIds.includes(id);
    if (!alreadyUnlocked && rule(progress, logs)) {
      newlyUnlocked.push(id);
    }
  }

  return newlyUnlocked;
}
