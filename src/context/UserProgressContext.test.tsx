import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UserProgressProvider, useUserProgress } from './UserProgressContext';

describe('UserProgressContext sequential update correctness', () => {
  beforeEach(() => {
    // The context reads real localStorage on mount (getProgress/getAchievements),
    // so each test needs a clean slate or results leak across tests in this file.
    window.localStorage.clear();
  });

  it('applies multiple synchronous gainXp calls cumulatively, not just the last one', () => {
    const { result } = renderHook(() => useUserProgress(), {
      wrapper: UserProgressProvider,
    });

    act(() => {
      result.current.gainXp({ amount: 10, reason: 'a' });
      result.current.gainXp({ amount: 50, reason: 'b' });
      result.current.gainXp({ amount: 100, reason: 'c' });
    });

    // Regression guard: with a stale-closure bug, this would be 100 (only
    // the last call's effect survives) instead of the correct 160.
    expect(result.current.progress.totalXp).toBe(160);
  });

  it('applies recordLogDate followed by gainXp calls in the same tick correctly', () => {
    const { result } = renderHook(() => useUserProgress(), {
      wrapper: UserProgressProvider,
    });

    act(() => {
      result.current.recordLogDate('2026-06-23');
      result.current.gainXp({ amount: 10, reason: 'daily check-in' });
      result.current.gainXp({ amount: 50, reason: 'workout' });
    });

    expect(result.current.progress.currentStreak).toBe(1);
    expect(result.current.progress.totalXp).toBe(60);
  });

  it('accumulates XP correctly across a simulated multi-day loop in a single act block', () => {
    const { result } = renderHook(() => useUserProgress(), {
      wrapper: UserProgressProvider,
    });

    const dates = ['2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23'];

    act(() => {
      for (const date of dates) {
        result.current.recordLogDate(date);
        result.current.gainXp({ amount: 10, reason: 'daily check-in' });
      }
    });

    expect(result.current.progress.totalXp).toBe(40); // 4 days x 10 XP
    expect(result.current.progress.currentStreak).toBe(4);
  });

  it('setProgressDirectly replaces state wholesale without re-applying any deltas', () => {
    const { result } = renderHook(() => useUserProgress(), {
      wrapper: UserProgressProvider,
    });

    act(() => {
      result.current.gainXp({ amount: 10, reason: 'pre-existing' });
    });
    expect(result.current.progress.totalXp).toBe(10);

    act(() => {
      result.current.setProgressDirectly({
        totalXp: 999,
        currentStreak: 12,
        longestStreak: 12,
        lastLogDate: '2026-06-23',
        unlockedAchievementIds: ['first_workout'],
      });
    });

    // The new state REPLACES the old one entirely — it is not 999 + 10.
    expect(result.current.progress.totalXp).toBe(999);
    expect(result.current.progress.currentStreak).toBe(12);
    expect(result.current.unlockedAchievementIds).toEqual(['first_workout']);
  });
});
