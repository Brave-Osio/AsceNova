import { describe, it, expect } from 'vitest';
import { profileSchema, type ProfileFormValues } from './schemas';

const VALID: ProfileFormValues = {
  fullName: 'Juan Dela Cruz',
  age: '25',
  gender: 'MALE',
  heightCm: '175',
  currentWeightKg: '70',
  goalWeightKg: '65',
  goal: 'WEIGHT_LOSS',
  fitnessLevel: 'BEGINNER',
  equipmentAccess: 'BOTH',
  activityLevel: 'MODERATELY_ACTIVE',
  workoutFrequency: '4',
  preferredSplitStyle: 'PUSH_PULL_LEGS',
  preferredWorkoutTime: 'MORNING',
  sleepHoursTarget: '8',
};

function messageFor(overrides: Partial<ProfileFormValues>, field: keyof ProfileFormValues): string | undefined {
  const result = profileSchema.safeParse({ ...VALID, ...overrides });
  if (result.success) return undefined;
  return result.error.issues.find((i) => i.path[0] === field)?.message;
}

describe('profileSchema numeric validation', () => {
  it('accepts a valid profile and blank optional fields', () => {
    expect(profileSchema.safeParse(VALID).success).toBe(true);
    expect(profileSchema.safeParse({ ...VALID, goalWeightKg: '', workoutFrequency: '', sleepHoursTarget: '' }).success).toBe(true);
  });

  it('rejects negative values with a field-specific message', () => {
    expect(messageFor({ age: '-20' }, 'age')).toBe('Age cannot be negative');
    expect(messageFor({ heightCm: '-170' }, 'heightCm')).toBe('Height (cm) cannot be negative');
    expect(messageFor({ currentWeightKg: '-70' }, 'currentWeightKg')).toBe('Weight (kg) cannot be negative');
    expect(messageFor({ workoutFrequency: '-1' }, 'workoutFrequency')).toBe('Workout days per week cannot be negative');
    expect(messageFor({ sleepHoursTarget: '-8' }, 'sleepHoursTarget')).toBe('Sleep hours cannot be negative');
  });

  it('requires whole numbers for age and workout days', () => {
    expect(messageFor({ age: '25.5' }, 'age')).toBe('Age must be a whole number');
    expect(messageFor({ workoutFrequency: '3.5' }, 'workoutFrequency')).toBe('Workout days per week must be a whole number');
  });

  it('rejects out-of-range, empty and non-numeric values without coercing them', () => {
    expect(messageFor({ workoutFrequency: '8' }, 'workoutFrequency')).toMatch(/between 1 and 7/);
    expect(messageFor({ sleepHoursTarget: '20' }, 'sleepHoursTarget')).toMatch(/between 3 and 12/);
    expect(messageFor({ age: '' }, 'age')).toBe('Age is required');
    expect(messageFor({ heightCm: 'tall' }, 'heightCm')).toBe('Height (cm) must be a number');
  });
});
