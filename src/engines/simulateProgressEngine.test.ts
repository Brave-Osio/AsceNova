import { describe, it, expect } from 'vitest';
import { generateSyntheticDays } from './simulateProgressEngine';

describe('simulateProgressEngine.generateSyntheticDays', () => {
  it('produces exactly `days` entries', () => {
    const results = generateSyntheticDays(null, 10);
    expect(results).toHaveLength(10);
  });

  it('produces consecutive calendar dates starting from tomorrow when there is no last log', () => {
    const results = generateSyntheticDays(null, 3);
    const dates = results.map((r) => r.date);
    const unique = new Set(dates);
    expect(unique.size).toBe(3); // all distinct
    expect(dates).toEqual([...dates].sort()); // strictly increasing
  });

  it('continues from the day after the given lastLogDate', () => {
    const results = generateSyntheticDays('2026-06-23', 3);
    expect(results[0].date).toBe('2026-06-24');
    expect(results[1].date).toBe('2026-06-25');
    expect(results[2].date).toBe('2026-06-26');
  });

  it('generates a plausible weight for every day', () => {
    const results = generateSyntheticDays(null, 20);
    for (const day of results) {
      expect(day.weightKg).toBeGreaterThanOrEqual(68);
      expect(day.weightKg).toBeLessThanOrEqual(72);
    }
  });

  it('produces a habits object with all five keys for every day', () => {
    const results = generateSyntheticDays(null, 5);
    for (const day of results) {
      expect(Object.keys(day.habits).sort()).toEqual(
        ['hitProteinGoal', 'hitWaterGoal', 'reachedStepGoal', 'slept7PlusHours', 'workoutCompleted'].sort(),
      );
    }
  });
});
