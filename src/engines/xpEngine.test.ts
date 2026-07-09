import { describe, it, expect } from 'vitest';
import { addXp, XP_EVENTS } from './xpEngine';
import { DEFAULT_PROGRESS } from '../types/gamification.types';

describe('xpEngine.addXp', () => {
  it('adds the event amount to totalXp', () => {
    const result = addXp(DEFAULT_PROGRESS, { amount: 50, reason: 'test' });
    expect(result.totalXp).toBe(50);
  });

  it('does not mutate the original progress object', () => {
    const original = { ...DEFAULT_PROGRESS };
    addXp(DEFAULT_PROGRESS, { amount: 50, reason: 'test' });
    expect(DEFAULT_PROGRESS).toEqual(original);
  });

  it('accumulates correctly across multiple sequential additions', () => {
    let progress = DEFAULT_PROGRESS;
    progress = addXp(progress, XP_EVENTS.dailyCheckIn()); // +10
    progress = addXp(progress, XP_EVENTS.workoutCompleted()); // +50
    progress = addXp(progress, XP_EVENTS.achievementUnlock()); // +100
    expect(progress.totalXp).toBe(160);
  });
});

describe('xpEngine.XP_EVENTS', () => {
  it('produces the correct amount for each predefined event', () => {
    expect(XP_EVENTS.dailyCheckIn().amount).toBe(10);
    expect(XP_EVENTS.workoutCompleted().amount).toBe(50);
    expect(XP_EVENTS.sevenDayStreak().amount).toBe(100);
    expect(XP_EVENTS.thirtyDayStreak().amount).toBe(500);
    expect(XP_EVENTS.achievementUnlock().amount).toBe(100);
    expect(XP_EVENTS.goalProgress().amount).toBe(100);
  });
});
