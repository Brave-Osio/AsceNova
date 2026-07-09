import { describe, it, expect } from 'vitest';
import { simulateProgress } from './simulateProgressEngine';
import { DEFAULT_PROGRESS } from '../types/gamification.types';

describe('simulateProgressEngine.simulateProgress', () => {
  it('produces exactly one result per simulated day', () => {
    const results = simulateProgress(DEFAULT_PROGRESS, [], 10);
    expect(results).toHaveLength(10);
  });

  it('produces a strictly increasing streak across consecutive simulated days', () => {
    const results = simulateProgress(DEFAULT_PROGRESS, [], 10);
    results.forEach((result, index) => {
      expect(result.progress.currentStreak).toBe(index + 1);
    });
  });

  it('awards the 7-day streak XP bonus exactly when the streak reaches 7', () => {
    const results = simulateProgress(DEFAULT_PROGRESS, [], 10);
    const day6Xp = results[5].progress.totalXp; // index 5 = day 6
    const day7Xp = results[6].progress.totalXp; // index 6 = day 7

    // day 7 should jump by at least dailyCheckIn (10) + sevenDayStreak (100) = 110,
    // possibly +50 more if that day's simulated workout happened to be true.
    expect(day7Xp - day6Xp).toBeGreaterThanOrEqual(110);
  });

  it('never decreases totalXp across the simulated sequence', () => {
    const results = simulateProgress(DEFAULT_PROGRESS, [], 45);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].progress.totalXp).toBeGreaterThanOrEqual(results[i - 1].progress.totalXp);
    }
  });

  it('eventually unlocks first_workout within a long enough simulation', () => {
    const results = simulateProgress(DEFAULT_PROGRESS, [], 45);
    const allUnlocked = results.flatMap((r) => r.newlyUnlockedAchievementIds);
    expect(allUnlocked).toContain('first_workout');
  });

  it('does not unlock the same achievement twice across the sequence', () => {
    const results = simulateProgress(DEFAULT_PROGRESS, [], 45);
    const allUnlocked = results.flatMap((r) => r.newlyUnlockedAchievementIds);
    const uniqueUnlocked = new Set(allUnlocked);
    expect(allUnlocked.length).toBe(uniqueUnlocked.size);
  });

  it('continues the streak from existing progress rather than restarting at 1', () => {
    const existingProgress = {
      ...DEFAULT_PROGRESS,
      currentStreak: 5,
      longestStreak: 5,
      lastLogDate: '2026-06-23',
    };
    const results = simulateProgress(existingProgress, [], 3);
    expect(results[0].progress.currentStreak).toBe(6);
    expect(results[2].progress.currentStreak).toBe(8);
  });
});
