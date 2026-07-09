import { describe, it, expect } from 'vitest';
import { calculateStreak, isStreakBroken } from './streakEngine';
import { DEFAULT_PROGRESS } from '../types/gamification.types';

describe('streakEngine.calculateStreak', () => {
  it('starts a streak at 1 on the very first log', () => {
    const result = calculateStreak(DEFAULT_PROGRESS, '2026-06-23');
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastLogDate).toBe('2026-06-23');
  });

  it('does not change the streak count when logging the same day twice', () => {
    const afterFirstLog = calculateStreak(DEFAULT_PROGRESS, '2026-06-23');
    const afterSecondLog = calculateStreak(afterFirstLog, '2026-06-23');
    expect(afterSecondLog.currentStreak).toBe(1);
  });

  it('increments the streak when logging exactly the next day', () => {
    const day1 = calculateStreak(DEFAULT_PROGRESS, '2026-06-23');
    const day2 = calculateStreak(day1, '2026-06-24');
    expect(day2.currentStreak).toBe(2);
    expect(day2.longestStreak).toBe(2);
  });

  it('resets the streak to 1 after a gap of more than one day', () => {
    const day1 = calculateStreak(DEFAULT_PROGRESS, '2026-06-23');
    const day2 = calculateStreak(day1, '2026-06-24');
    const day3 = calculateStreak(day2, '2026-06-25');
    // skip two days entirely
    const afterGap = calculateStreak(day3, '2026-06-28');
    expect(afterGap.currentStreak).toBe(1);
  });

  it('preserves longestStreak even after the current streak resets', () => {
    const day1 = calculateStreak(DEFAULT_PROGRESS, '2026-06-23');
    const day2 = calculateStreak(day1, '2026-06-24');
    const day3 = calculateStreak(day2, '2026-06-25'); // longestStreak now 3
    const afterGap = calculateStreak(day3, '2026-06-30'); // streak resets to 1
    expect(afterGap.currentStreak).toBe(1);
    expect(afterGap.longestStreak).toBe(3);
  });
});

describe('streakEngine.isStreakBroken', () => {
  it('is false for a brand-new user with no logs yet', () => {
    expect(isStreakBroken(DEFAULT_PROGRESS, '2026-06-23')).toBe(false);
  });

  it('is false when checked the same day as the last log', () => {
    const progress = { ...DEFAULT_PROGRESS, lastLogDate: '2026-06-23' };
    expect(isStreakBroken(progress, '2026-06-23')).toBe(false);
  });

  it('is false when checked exactly one day after the last log', () => {
    const progress = { ...DEFAULT_PROGRESS, lastLogDate: '2026-06-23' };
    expect(isStreakBroken(progress, '2026-06-24')).toBe(false);
  });

  it('is true when checked two or more days after the last log', () => {
    const progress = { ...DEFAULT_PROGRESS, lastLogDate: '2026-06-23' };
    expect(isStreakBroken(progress, '2026-06-25')).toBe(true);
  });
});
