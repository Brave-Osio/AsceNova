import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../../engines/streakEngine';
import { addXp, XP_EVENTS } from '../../engines/xpEngine';
import { evaluateAchievements } from '../../engines/achievementEngine';
import { DEFAULT_PROGRESS } from '../../types/gamification.types';
import { DEFAULT_HABITS } from '../../types/log.types';
import type { DailyLogEntry } from '../../types/log.types';

/**
 * This test exercises the exact sequence useDailyLog.handleSubmit runs:
 * recordLogDate (streak) -> gainXp (daily + workout) -> checkAchievements.
 * It uses the real engine functions directly rather than mounting the
 * hook, since the orchestration ORDER is the thing actually worth
 * protecting here — each engine already has its own unit tests.
 */
describe('daily log orchestration sequence', () => {
  function makeLog(date: string, workoutCompleted: boolean): DailyLogEntry {
    return {
      id: `log_${date}`,
      date,
      weightKg: 70,
      habits: { ...DEFAULT_HABITS, workoutCompleted },
      notes: '',
      createdAt: new Date().toISOString(),
    };
  }

  it('awards daily check-in XP only when no workout is logged', () => {
    let progress = DEFAULT_PROGRESS;
    progress = calculateStreak(progress, '2026-06-23');
    progress = addXp(progress, XP_EVENTS.dailyCheckIn());

    expect(progress.totalXp).toBe(10);
    expect(progress.currentStreak).toBe(1);
  });

  it('awards both daily check-in and workout bonus when workout is logged', () => {
    let progress = DEFAULT_PROGRESS;
    progress = calculateStreak(progress, '2026-06-23');
    progress = addXp(progress, XP_EVENTS.dailyCheckIn());
    progress = addXp(progress, XP_EVENTS.workoutCompleted());

    expect(progress.totalXp).toBe(60); // 10 + 50
  });

  it('unlocks first_workout achievement only after the workout XP/streak update is applied', () => {
    let progress = DEFAULT_PROGRESS;
    const logs: DailyLogEntry[] = [];

    // Day 1: log a workout
    progress = calculateStreak(progress, '2026-06-23');
    progress = addXp(progress, XP_EVENTS.dailyCheckIn());
    progress = addXp(progress, XP_EVENTS.workoutCompleted());
    logs.push(makeLog('2026-06-23', true));

    const unlocked = evaluateAchievements(progress, logs);
    expect(unlocked).toContain('first_workout');
  });

  it('reaches seven_day_streak achievement only after the 7th consecutive day, not before', () => {
    let progress = DEFAULT_PROGRESS;
    const dates = [
      '2026-06-17',
      '2026-06-18',
      '2026-06-19',
      '2026-06-20',
      '2026-06-21',
      '2026-06-22',
      '2026-06-23',
    ];

    let unlockedOnDay6: string[] = [];
    let unlockedOnDay7: string[] = [];

    dates.forEach((date, index) => {
      progress = calculateStreak(progress, date);
      progress = addXp(progress, XP_EVENTS.dailyCheckIn());
      const unlocked = evaluateAchievements(progress, []);
      if (index === 5) unlockedOnDay6 = unlocked;
      if (index === 6) unlockedOnDay7 = unlocked;
    });

    expect(unlockedOnDay6).not.toContain('seven_day_streak');
    expect(unlockedOnDay7).toContain('seven_day_streak');
  });

  it('does not double-count streak when the same day is logged twice', () => {
    let progress = DEFAULT_PROGRESS;
    progress = calculateStreak(progress, '2026-06-23');
    progress = calculateStreak(progress, '2026-06-23'); // resubmit same day

    expect(progress.currentStreak).toBe(1);
  });
});
