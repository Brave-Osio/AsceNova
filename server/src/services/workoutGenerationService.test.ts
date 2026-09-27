import { describe, it, expect } from 'vitest';
import { workoutDetailResponseSchema, buildPrompt } from './workoutGenerationService.js';
import type { Profile } from '@prisma/client';
import type { AdherenceSummary } from './planService.js';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile_1',
    userId: 'user_1',
    fullName: 'Test User',
    birthday: null,
    age: 30,
    gender: null,
    heightCm: 175,
    currentWeightKg: 80,
    goalWeightKg: null,
    goal: 'WEIGHT_LOSS',
    fitnessLevel: 'INTERMEDIATE',
    equipmentAccess: 'GYM',
    activityLevel: null,
    workoutFrequency: null,
    preferredSplitStyle: null,
    dailySchedule: null,
    sleepHoursTarget: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const skeleton = [{ day: 'Monday', focus: 'Push Day' }];

function makeExercise(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: 'Bench Press',
    sets: 4,
    reps: '8-10',
    restSeconds: 90,
    targetMuscles: ['chest', 'triceps'],
    difficulty: 'INTERMEDIATE',
    ...overrides,
  };
}

function makeDay(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    workoutName: 'Push Day A',
    warmUp: '5 min treadmill, arm circles',
    coolDown: 'Stretch chest and triceps',
    estimatedDurationMinutes: 60,
    estimatedCaloriesBurned: 400,
    coachingTips: ['Keep your core braced'],
    progressionAdvice: 'Add 2.5kg once you hit the top of the rep range for all sets.',
    exercises: [makeExercise()],
    ...overrides,
  };
}

function makeResponse(days = Array.from({ length: 7 }, () => makeDay())) {
  return { days };
}

describe('workoutDetailResponseSchema', () => {
  it('accepts a well-formed 7-day response', () => {
    const result = workoutDetailResponseSchema.parse(makeResponse());
    expect(result.days).toHaveLength(7);
  });

  it('accepts a rest day with zero exercises', () => {
    const restDay = makeDay({ exercises: [], warmUp: null, workoutName: null });
    const days = Array.from({ length: 7 }, (_, i) => (i === 6 ? restDay : makeDay()));
    const result = workoutDetailResponseSchema.parse(makeResponse(days));
    expect(result.days[6].exercises).toHaveLength(0);
  });

  it('rejects a response with fewer than 7 days', () => {
    expect(() => workoutDetailResponseSchema.parse(makeResponse(Array.from({ length: 6 }, () => makeDay())))).toThrow();
  });

  it('rejects a response with more than 7 days', () => {
    expect(() => workoutDetailResponseSchema.parse(makeResponse(Array.from({ length: 8 }, () => makeDay())))).toThrow();
  });

  it('rejects an exercise with an invalid difficulty value', () => {
    const days = Array.from({ length: 7 }, () => makeDay({ exercises: [makeExercise({ difficulty: 'EXPERT' })] }));
    expect(() => workoutDetailResponseSchema.parse(makeResponse(days))).toThrow();
  });

  it('rejects an exercise missing required fields', () => {
    const days = Array.from({ length: 7 }, () => makeDay({ exercises: [{ name: 'Bench Press' }] }));
    expect(() => workoutDetailResponseSchema.parse(makeResponse(days))).toThrow();
  });

  it('rejects a day missing coachingTips', () => {
    const days = Array.from({ length: 7 }, () => {
      const day = makeDay();
      delete (day as Record<string, unknown>).coachingTips;
      return day;
    });
    expect(() => workoutDetailResponseSchema.parse(makeResponse(days))).toThrow();
  });
});

describe('workoutGenerationService.buildPrompt (adherence section)', () => {
  it('omits the RECENT ADHERENCE section entirely when adherence is null (brand-new user)', () => {
    const prompt = buildPrompt(makeProfile(), skeleton, [], null);
    expect(prompt).not.toContain('RECENT ADHERENCE');
  });

  it('includes completion rate and streak when adherence data is present', () => {
    const adherence: AdherenceSummary = {
      workoutCompletionRate: 0.75,
      currentStreak: 5,
      weightTrend: 'unknown',
      onTrackForGoal: null,
    };
    const prompt = buildPrompt(makeProfile(), skeleton, [], adherence);
    expect(prompt).toContain('RECENT ADHERENCE');
    expect(prompt).toContain('75%');
    expect(prompt).toContain('streak: 5 days');
    expect(prompt).not.toContain('Weight trend'); // omitted when trend is 'unknown'
  });

  it('includes weight trend and on-track wording when a clear trend exists', () => {
    const adherence: AdherenceSummary = {
      workoutCompletionRate: 0.5,
      currentStreak: 2,
      weightTrend: 'losing',
      onTrackForGoal: true,
    };
    const prompt = buildPrompt(makeProfile({ goal: 'WEIGHT_LOSS' }), skeleton, [], adherence);
    expect(prompt).toContain('Weight trend: losing, on track for their WEIGHT_LOSS goal');
  });
});
