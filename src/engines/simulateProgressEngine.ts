import { toDateString } from '../utils/dateUtils';
import type { DailyHabits } from '../types/log.types';

export interface SyntheticDay {
  date: string;
  weightKg: number;
  habits: DailyHabits;
}

/**
 * Generates `days` consecutive synthetic day inputs starting the day
 * after `lastLogDate` (or today if there are none) — used by the
 * Simulate feature, which replays these through the REAL backend
 * endpoints (logService.upsertLog + progressService.applyDailyLog) one
 * day at a time rather than computing progress locally. This keeps a
 * single source of truth for the gamification math instead of
 * maintaining a parallel copy of it just for the demo.
 *
 * Each habit is independently randomized per day (70% chance) to
 * produce a believable, varied history rather than a suspiciously
 * uniform "everything checked every day" pattern.
 */
export function generateSyntheticDays(lastLogDate: string | null, days: number = 45): SyntheticDay[] {
  const results: SyntheticDay[] = [];

  const startDate = new Date();
  if (lastLogDate) {
    startDate.setTime(new Date(lastLogDate + 'T00:00:00').getTime());
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

    results.push({ date: dateString, weightKg, habits });
  }

  return results;
}
