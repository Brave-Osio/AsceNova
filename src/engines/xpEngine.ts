import { XP_REWARDS } from '../constants/xpRules';
import type { UserProgress, XpGainEvent } from '../types/gamification.types';

/**
 * Pure function: given current progress and an XP gain event, returns
 * the NEW progress object. Never mutates the input, never touches
 * storage. Callers (hooks/features) are responsible for persisting
 * the result via userProgressStorage.saveProgress().
 */
export function addXp(progress: UserProgress, event: XpGainEvent): UserProgress {
  return {
    ...progress,
    totalXp: progress.totalXp + event.amount,
  };
}

/** Convenience constructors so callers don't hardcode reason strings or amounts. */
export const XP_EVENTS = {
  dailyCheckIn: (): XpGainEvent => ({ amount: XP_REWARDS.dailyCheckIn, reason: 'Daily Check-In' }),
  workoutCompleted: (): XpGainEvent => ({
    amount: XP_REWARDS.workoutCompleted,
    reason: 'Workout Completed',
  }),
  hitWaterGoal: (): XpGainEvent => ({ amount: XP_REWARDS.hitWaterGoal, reason: 'Hit Water Goal' }),
  hitProteinGoal: (): XpGainEvent => ({
    amount: XP_REWARDS.hitProteinGoal,
    reason: 'Hit Protein Goal',
  }),
  slept7PlusHours: (): XpGainEvent => ({
    amount: XP_REWARDS.slept7PlusHours,
    reason: 'Slept 7+ Hours',
  }),
  reachedStepGoal: (): XpGainEvent => ({
    amount: XP_REWARDS.reachedStepGoal,
    reason: 'Reached Step Goal',
  }),
  sevenDayStreak: (): XpGainEvent => ({
    amount: XP_REWARDS.sevenDayStreak,
    reason: '7-Day Streak',
  }),
  thirtyDayStreak: (): XpGainEvent => ({
    amount: XP_REWARDS.thirtyDayStreak,
    reason: '30-Day Streak',
  }),
  achievementUnlock: (): XpGainEvent => ({
    amount: XP_REWARDS.achievementUnlock,
    reason: 'Achievement Unlock',
  }),
  goalProgress: (): XpGainEvent => ({ amount: XP_REWARDS.goalProgress, reason: 'Goal Progress' }),
};
