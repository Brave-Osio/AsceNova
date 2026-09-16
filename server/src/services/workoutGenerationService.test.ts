import { describe, it, expect } from 'vitest';
import { workoutDetailResponseSchema } from './workoutGenerationService.js';

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
