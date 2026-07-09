import { addXp, XP_EVENTS } from './xpEngine';
import { calculateStreak } from './streakEngine';
import { evaluateAchievements } from './achievementEngine';
import { toDateString } from '../utils/dateUtils';
import type { UserProgress } from '../types/gamification.types';
import type { DailyHabits, DailyLogEntry } from '../types/log.types';

export interface SimulatedDayResult {
  date: string;
  weightKg: number;
  habits: DailyHabits;
  progress: UserProgress;
  newlyUnlockedAchievementIds: string[];
}

/**
 * Replays `days` consecutive days of activity starting the day after
 * the most recent real log (or today, if there are none), applying the
 * SAME engine functions Daily Log uses — addXp, calculateStreak,
 * evaluateAchievements. This is deliberate: the demo must exercise the
 * real rules, not a separate "looks similar" fake path, or the
 * simulation could mislead about what the app actually does.
 *
 * Returns one result per simulated day so the UI can animate through
 * them sequentially rather than jumping straight to the final state.
 *
 * Each habit is independently randomized per day (70% chance) to
 * produce a believable, varied history rather than a suspiciously
 * uniform "everything checked every day" pattern.
 */
export function simulateProgress(
  startingProgress: UserProgress,
  existingLogs: DailyLogEntry[],
  days: number = 45,
): SimulatedDayResult[] {
  const results: SimulatedDayResult[] = [];

  let progress = startingProgress;
  let logs = [...existingLogs];

  const startDate = new Date();
  if (startingProgress.lastLogDate) {
    startDate.setTime(new Date(startingProgress.lastLogDate + 'T00:00:00').getTime());
  }

  for (let i = 1; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateString = toDateString(date);

    const habits: DailyHabits = {
      workoutCompleted: Math.random() < 0.7,
      hitWaterGoal: Math.random() < 0.7,
      hitProteinGoal: Math.random() < 0.7,
      slept7PlusHours: Math.random() < 0.7,
      reachedStepGoal: Math.random() < 0.7,
    };
    const weightKg = Math.round((70 + (Math.random() - 0.5) * 4) * 10) / 10;

    progress = calculateStreak(progress, dateString);
    progress = addXp(progress, XP_EVENTS.dailyCheckIn());
    if (habits.workoutCompleted) progress = addXp(progress, XP_EVENTS.workoutCompleted());
    if (habits.hitWaterGoal) progress = addXp(progress, XP_EVENTS.hitWaterGoal());
    if (habits.hitProteinGoal) progress = addXp(progress, XP_EVENTS.hitProteinGoal());
    if (habits.slept7PlusHours) progress = addXp(progress, XP_EVENTS.slept7PlusHours());
    if (habits.reachedStepGoal) progress = addXp(progress, XP_EVENTS.reachedStepGoal());

    logs = [
      ...logs,
      {
        id: `sim_${dateString}`,
        date: dateString,
        weightKg,
        habits,
        notes: 'Simulated progress',
        createdAt: new Date().toISOString(),
      },
    ];

    if (progress.currentStreak === 7) {
      progress = addXp(progress, XP_EVENTS.sevenDayStreak());
    }
    if (progress.currentStreak === 30) {
      progress = addXp(progress, XP_EVENTS.thirtyDayStreak());
    }

    const newlyUnlocked = evaluateAchievements(progress, logs);
    if (newlyUnlocked.length > 0) {
      progress = {
        ...progress,
        totalXp: progress.totalXp + newlyUnlocked.length * 100,
        unlockedAchievementIds: [...progress.unlockedAchievementIds, ...newlyUnlocked],
      };
    }

    results.push({ date: dateString, weightKg, habits, progress, newlyUnlockedAchievementIds: newlyUnlocked });
  }

  return results;
}
