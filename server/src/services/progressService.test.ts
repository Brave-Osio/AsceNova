import { describe, it, expect } from 'vitest';
import { getRankForXp, calculateStreak, evaluateAchievements } from './progressService.js';

describe('progressService.getRankForXp', () => {
  it('returns IRON at 0 XP', () => {
    expect(getRankForXp(0)).toBe('IRON');
  });

  it('returns the exact rank at an inclusive lower-bound threshold', () => {
    expect(getRankForXp(500)).toBe('BRONZE');
    expect(getRankForXp(499)).toBe('IRON');
  });

  it('returns RADIANT at and above the highest threshold', () => {
    expect(getRankForXp(25000)).toBe('RADIANT');
    expect(getRankForXp(999999)).toBe('RADIANT');
  });
});

describe('progressService.calculateStreak', () => {
  it('starts a streak at 1 on the first-ever log', () => {
    const result = calculateStreak(0, 0, null, new Date('2026-01-01'));
    expect(result).toEqual({ currentStreak: 1, longestStreak: 1 });
  });

  it('leaves the streak unchanged for a same-day re-log', () => {
    const result = calculateStreak(5, 5, new Date('2026-01-01'), new Date('2026-01-01'));
    expect(result).toEqual({ currentStreak: 5, longestStreak: 5 });
  });

  it('increments the streak for a consecutive day', () => {
    const result = calculateStreak(5, 5, new Date('2026-01-01'), new Date('2026-01-02'));
    expect(result).toEqual({ currentStreak: 6, longestStreak: 6 });
  });

  it('resets the streak to 1 after a gap of more than one day', () => {
    const result = calculateStreak(5, 10, new Date('2026-01-01'), new Date('2026-01-05'));
    expect(result).toEqual({ currentStreak: 1, longestStreak: 10 });
  });

  it('keeps the longest streak even after a reset', () => {
    const result = calculateStreak(3, 20, new Date('2026-01-01'), new Date('2026-01-10'));
    expect(result.longestStreak).toBe(20);
  });
});

describe('progressService.evaluateAchievements (rank/streak-based rules only — no DB)', () => {
  const baseCtx = {
    currentStreak: 0,
    totalXp: 0,
    logCount: 0,
    hasWorkoutLog: false,
    workoutCount: 0,
    waterGoalCount: 0,
    proteinGoalCount: 0,
    weightGoalReached: false,
    hasChatted: false,
  };

  it('unlocks seven_day_streak once currentStreak reaches 7', () => {
    const unlocked = evaluateAchievements({ ...baseCtx, currentStreak: 7 }, []);
    expect(unlocked).toContain('seven_day_streak');
  });

  it('does not re-unlock an achievement already in the unlocked list', () => {
    const unlocked = evaluateAchievements({ ...baseCtx, currentStreak: 7 }, ['seven_day_streak']);
    expect(unlocked).not.toContain('seven_day_streak');
  });

  it('unlocks bronze_promotion once XP crosses the Bronze threshold', () => {
    const unlocked = evaluateAchievements({ ...baseCtx, totalXp: 500 }, []);
    expect(unlocked).toContain('bronze_promotion');
    expect(unlocked).not.toContain('silver_promotion');
  });

  it('unlocks discipline_champion at a 100-day streak', () => {
    const unlocked = evaluateAchievements({ ...baseCtx, currentStreak: 100 }, []);
    expect(unlocked).toContain('discipline_champion');
  });

  it('unlocks first_workout only when hasWorkoutLog is true', () => {
    expect(evaluateAchievements({ ...baseCtx, hasWorkoutLog: true }, [])).toContain('first_workout');
    expect(evaluateAchievements(baseCtx, [])).not.toContain('first_workout');
  });

  it('unlocks hydration_hero once waterGoalCount reaches 14', () => {
    expect(evaluateAchievements({ ...baseCtx, waterGoalCount: 14 }, [])).toContain('hydration_hero');
    expect(evaluateAchievements({ ...baseCtx, waterGoalCount: 13 }, [])).not.toContain('hydration_hero');
  });

  it('unlocks protein_pro once proteinGoalCount reaches 14', () => {
    expect(evaluateAchievements({ ...baseCtx, proteinGoalCount: 14 }, [])).toContain('protein_pro');
    expect(evaluateAchievements({ ...baseCtx, proteinGoalCount: 13 }, [])).not.toContain('protein_pro');
  });

  it('unlocks twenty_workouts once workoutCount reaches 20', () => {
    expect(evaluateAchievements({ ...baseCtx, workoutCount: 20 }, [])).toContain('twenty_workouts');
    expect(evaluateAchievements({ ...baseCtx, workoutCount: 19 }, [])).not.toContain('twenty_workouts');
  });

  it('unlocks goal_crusher only when weightGoalReached is true', () => {
    expect(evaluateAchievements({ ...baseCtx, weightGoalReached: true }, [])).toContain('goal_crusher');
    expect(evaluateAchievements(baseCtx, [])).not.toContain('goal_crusher');
  });

  it('unlocks ask_the_coach only when hasChatted is true', () => {
    expect(evaluateAchievements({ ...baseCtx, hasChatted: true }, [])).toContain('ask_the_coach');
    expect(evaluateAchievements(baseCtx, [])).not.toContain('ask_the_coach');
  });

  it('unlocks platinum_promotion once XP crosses the Platinum threshold', () => {
    const unlocked = evaluateAchievements({ ...baseCtx, totalXp: 5000 }, []);
    expect(unlocked).toContain('platinum_promotion');
    expect(evaluateAchievements({ ...baseCtx, totalXp: 4999 }, [])).not.toContain('platinum_promotion');
  });
});
