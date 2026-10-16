import { describe, expect, it } from 'vitest';
import { upsertProfileSchema } from './profile.validators.js';

const VALID = {
  fullName: 'Juan Dela Cruz',
  age: 25,
  heightCm: 175,
  currentWeightKg: 70,
  goal: 'WEIGHT_LOSS',
  fitnessLevel: 'BEGINNER',
  equipmentAccess: 'BOTH',
  workoutFrequency: 4,
  sleepHoursTarget: 8,
};

describe('upsertProfileSchema', () => {
  it('accepts a valid profile', () => {
    expect(upsertProfileSchema.safeParse(VALID).success).toBe(true);
  });

  it('rejects negative values', () => {
    for (const patch of [{ age: -1 }, { heightCm: -170 }, { currentWeightKg: -70 }, { workoutFrequency: -2 }, { sleepHoursTarget: -8 }]) {
      expect(upsertProfileSchema.safeParse({ ...VALID, ...patch }).success).toBe(false);
    }
  });

  it('requires whole numbers for age and workout days', () => {
    expect(upsertProfileSchema.safeParse({ ...VALID, age: 25.5 }).success).toBe(false);
    expect(upsertProfileSchema.safeParse({ ...VALID, workoutFrequency: 3.5 }).success).toBe(false);
  });

  it('enforces workout-day and sleep ranges', () => {
    expect(upsertProfileSchema.safeParse({ ...VALID, workoutFrequency: 8 }).success).toBe(false);
    expect(upsertProfileSchema.safeParse({ ...VALID, sleepHoursTarget: 2 }).success).toBe(false);
    expect(upsertProfileSchema.safeParse({ ...VALID, sleepHoursTarget: 13 }).success).toBe(false);
  });
});
