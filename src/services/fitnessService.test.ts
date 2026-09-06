import { describe, it, expect } from 'vitest';
import { generatePlan } from './fitnessService';
import type { Profile } from '../types/profile.types';

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('fitnessService.generatePlan', () => {
  it('produces different workout days for different split styles given the same profile', async () => {
    const profile = makeProfile();
    const pplPlan = await generatePlan(profile, 'push_pull_legs');
    const upperLowerPlan = await generatePlan(profile, 'upper_lower');
    const fullBodyPlan = await generatePlan(profile, 'full_body');

    expect(pplPlan.workoutDays).not.toEqual(upperLowerPlan.workoutDays);
    expect(upperLowerPlan.workoutDays).not.toEqual(fullBodyPlan.workoutDays);
    expect(pplPlan.workoutDays).not.toEqual(fullBodyPlan.workoutDays);
  });

  it('produces the exact same workout days when regenerated with the same style and profile (deterministic)', async () => {
    const profile = makeProfile();
    const first = await generatePlan(profile, 'push_pull_legs');
    const second = await generatePlan(profile, 'push_pull_legs');

    expect(first.workoutDays).toEqual(second.workoutDays);
  });

  it('records which split style was used on the returned plan', async () => {
    const profile = makeProfile();
    const plan = await generatePlan(profile, 'upper_lower');
    expect(plan.splitStyle).toBe('upper_lower');
  });

  it('defaults to push_pull_legs when no style is passed', async () => {
    const profile = makeProfile();
    const plan = await generatePlan(profile);
    expect(plan.splitStyle).toBe('push_pull_legs');
  });

  it('swaps to bodyweight framing for push/pull/legs when equipment is home-only', async () => {
    const homeProfile = makeProfile({ equipmentAccess: 'HOME' });
    const plan = await generatePlan(homeProfile, 'push_pull_legs');

    const allFocuses = plan.workoutDays.map((d) => d.focus).join(' ');
    expect(allFocuses).toContain('Bodyweight');
  });

  it('does not add bodyweight framing when gym access is available', async () => {
    const gymProfile = makeProfile({ equipmentAccess: 'GYM' });
    const plan = await generatePlan(gymProfile, 'push_pull_legs');

    const allFocuses = plan.workoutDays.map((d) => d.focus).join(' ');
    expect(allFocuses).not.toContain('Bodyweight');
  });

  it('keeps the user-chosen style even when equipment access does not match it (does not override the pick)', async () => {
    const homeProfile = makeProfile({ equipmentAccess: 'HOME' });
    const plan = await generatePlan(homeProfile, 'upper_lower');
    expect(plan.splitStyle).toBe('upper_lower');
  });

  it('includes more cardio for weight_loss goal regardless of split style', async () => {
    const weightLossProfile = makeProfile({ goal: 'WEIGHT_LOSS' });
    const plan = await generatePlan(weightLossProfile, 'full_body');

    const allFocuses = plan.workoutDays.map((d) => d.focus).join(' ');
    expect(allFocuses.toLowerCase()).toContain('cardio');
  });

  it('produces consistent nutrition targets independent of split style', async () => {
    const profile = makeProfile();
    const pplPlan = await generatePlan(profile, 'push_pull_legs');
    const fullBodyPlan = await generatePlan(profile, 'full_body');

    expect(pplPlan.nutrition).toEqual(fullBodyPlan.nutrition);
  });
});
