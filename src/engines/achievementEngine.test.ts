import { describe, it, expect } from 'vitest';
import { evaluateAchievements } from './achievementEngine';
import { DEFAULT_PROGRESS } from '../types/gamification.types';
import { DEFAULT_HABITS } from '../types/log.types';
import type { DailyLogEntry, DailyHabits } from '../types/log.types';

function makeLog(habitOverrides: Partial<DailyHabits> = {}, logOverrides: Partial<DailyLogEntry> = {}): DailyLogEntry {
  return {
    id: 'log_1',
    date: '2026-06-23',
    weightKg: 70,
    habits: { ...DEFAULT_HABITS, ...habitOverrides },
    notes: '',
    createdAt: new Date().toISOString(),
    ...logOverrides,
  };
}

describe('achievementEngine.evaluateAchievements', () => {
  it('unlocks nothing for a brand-new user with no logs', () => {
    expect(evaluateAchievements(DEFAULT_PROGRESS, [])).toEqual([]);
  });

  it('unlocks first_workout when at least one log has workoutCompleted true', () => {
    const logs = [makeLog({ workoutCompleted: true })];
    const unlocked = evaluateAchievements(DEFAULT_PROGRESS, logs);
    expect(unlocked).toContain('first_workout');
  });

  it('does not unlock first_workout when no logs have a completed workout', () => {
    const logs = [makeLog({ workoutCompleted: false })];
    const unlocked = evaluateAchievements(DEFAULT_PROGRESS, logs);
    expect(unlocked).not.toContain('first_workout');
  });

  it('unlocks seven_day_streak only once currentStreak reaches 7', () => {
    const belowThreshold = { ...DEFAULT_PROGRESS, currentStreak: 6 };
    const atThreshold = { ...DEFAULT_PROGRESS, currentStreak: 7 };
    expect(evaluateAchievements(belowThreshold, [])).not.toContain('seven_day_streak');
    expect(evaluateAchievements(atThreshold, [])).toContain('seven_day_streak');
  });

  it('unlocks bronze_promotion as soon as rank moves past Iron', () => {
    const ironProgress = { ...DEFAULT_PROGRESS, totalXp: 499 };
    const bronzeProgress = { ...DEFAULT_PROGRESS, totalXp: 500 };
    expect(evaluateAchievements(ironProgress, [])).not.toContain('bronze_promotion');
    expect(evaluateAchievements(bronzeProgress, [])).toContain('bronze_promotion');
  });

  it('does not re-unlock an achievement already present in unlockedAchievementIds', () => {
    const progress = {
      ...DEFAULT_PROGRESS,
      currentStreak: 7,
      unlockedAchievementIds: ['seven_day_streak'],
    };
    const unlocked = evaluateAchievements(progress, []);
    expect(unlocked).not.toContain('seven_day_streak');
  });

  it('unlocks multiple achievements simultaneously when several conditions hold at once', () => {
    const progress = { ...DEFAULT_PROGRESS, currentStreak: 100, totalXp: 25000 };
    const unlocked = evaluateAchievements(progress, []);
    expect(unlocked).toContain('discipline_champion');
    expect(unlocked).toContain('seven_day_streak');
    expect(unlocked).toContain('thirty_day_streak');
    expect(unlocked).toContain('gold_promotion');
  });
});
