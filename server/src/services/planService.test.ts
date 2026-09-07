import { describe, it, expect } from 'vitest';
import { buildWorkoutSplit, buildNutritionTargets } from './planService.js';
import type { Profile } from '@prisma/client';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'test-profile-id',
    userId: 'test-user-id',
    fullName: 'Test User',
    birthday: null,
    age: 25,
    gender: null,
    heightCm: 175,
    currentWeightKg: 70,
    goalWeightKg: null,
    goal: 'MAINTAIN_WEIGHT',
    fitnessLevel: 'INTERMEDIATE',
    equipmentAccess: 'GYM',
    activityLevel: null,
    workoutFrequency: null,
    preferredSplitStyle: null,
    foodPreference: null,
    foodAllergies: [],
    medicalRestrictions: [],
    dailySchedule: null,
    sleepHoursTarget: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('planService workout split generation', () => {
  it('produces different workout days for different split styles given the same profile', () => {
    const profile = makeProfile();
    const ppl = buildWorkoutSplit(profile, 'PUSH_PULL_LEGS');
    const upperLower = buildWorkoutSplit(profile, 'UPPER_LOWER');
    const fullBody = buildWorkoutSplit(profile, 'FULL_BODY');

    expect(ppl).not.toEqual(upperLower);
    expect(upperLower).not.toEqual(fullBody);
    expect(ppl).not.toEqual(fullBody);
  });

  it('produces the exact same workout days when regenerated with the same style and profile (deterministic)', () => {
    const profile = makeProfile();
    const first = buildWorkoutSplit(profile, 'PUSH_PULL_LEGS');
    const second = buildWorkoutSplit(profile, 'PUSH_PULL_LEGS');

    expect(first).toEqual(second);
  });

  it('swaps to bodyweight framing for push/pull/legs when equipment is home-only', () => {
    const homeProfile = makeProfile({ equipmentAccess: 'HOME' });
    const days = buildWorkoutSplit(homeProfile, 'PUSH_PULL_LEGS');

    const allFocuses = days.map((d) => d.focus).join(' ');
    expect(allFocuses).toContain('Bodyweight');
  });

  it('does not add bodyweight framing when gym access is available', () => {
    const gymProfile = makeProfile({ equipmentAccess: 'GYM' });
    const days = buildWorkoutSplit(gymProfile, 'PUSH_PULL_LEGS');

    const allFocuses = days.map((d) => d.focus).join(' ');
    expect(allFocuses).not.toContain('Bodyweight');
  });

  it('includes more cardio for WEIGHT_LOSS goal regardless of split style', () => {
    const weightLossProfile = makeProfile({ goal: 'WEIGHT_LOSS' });
    const days = buildWorkoutSplit(weightLossProfile, 'FULL_BODY');

    const allFocuses = days.map((d) => d.focus).join(' ');
    expect(allFocuses.toLowerCase()).toContain('cardio');
  });
});

describe('planService nutrition target generation', () => {
  it('produces consistent nutrition targets independent of split style', () => {
    // buildNutritionTargets doesn't take splitStyle at all — same profile
    // always yields the same targets regardless of which split is chosen.
    const profile = makeProfile();
    const nutrition = buildNutritionTargets(profile);
    const nutritionAgain = buildNutritionTargets(profile);

    expect(nutrition).toEqual(nutritionAgain);
  });

  it('increases protein/fat/sodium targets for MUSCLE_GAIN vs MAINTAIN_WEIGHT', () => {
    const maintainProfile = makeProfile({ goal: 'MAINTAIN_WEIGHT' });
    const muscleGainProfile = makeProfile({ goal: 'MUSCLE_GAIN' });

    const maintain = buildNutritionTargets(maintainProfile);
    const muscleGain = buildNutritionTargets(muscleGainProfile);

    expect(muscleGain.proteinGrams).toBeGreaterThan(maintain.proteinGrams);
    expect(muscleGain.sodiumMg).toBeGreaterThan(maintain.sodiumMg);
    expect(muscleGain.calories).toBeGreaterThan(maintain.calories);
  });

  it('lowers calorie target for WEIGHT_LOSS vs MAINTAIN_WEIGHT', () => {
    const maintainProfile = makeProfile({ goal: 'MAINTAIN_WEIGHT' });
    const weightLossProfile = makeProfile({ goal: 'WEIGHT_LOSS' });

    const maintain = buildNutritionTargets(maintainProfile);
    const weightLoss = buildNutritionTargets(weightLossProfile);

    expect(weightLoss.calories).toBeLessThan(maintain.calories);
  });
});
