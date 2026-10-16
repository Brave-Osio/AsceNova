import { describe, expect, it } from 'vitest';
import { createGoalSchema, updateGoalSchema } from './goal.validators.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDate = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);

describe('createGoalSchema', () => {
  it('accepts a valid goal with a future date', () => {
    expect(createGoalSchema.safeParse({ goalType: 'WEIGHT_LOSS', targetValue: 70, targetDate: isoDate(30) }).success).toBe(true);
  });

  it('accepts a goal with no target value or date', () => {
    expect(createGoalSchema.safeParse({ goalType: 'MAINTAIN_WEIGHT' }).success).toBe(true);
  });

  it('rejects negative, zero and out-of-range target values', () => {
    for (const targetValue of [-5, 0, 29, 301]) {
      expect(createGoalSchema.safeParse({ goalType: 'WEIGHT_LOSS', targetValue }).success).toBe(false);
    }
  });

  it('rejects past and malformed target dates', () => {
    const past = createGoalSchema.safeParse({ goalType: 'WEIGHT_LOSS', targetDate: isoDate(-10) });
    expect(past.success).toBe(false);
    expect(createGoalSchema.safeParse({ goalType: 'WEIGHT_LOSS', targetDate: 'not-a-date' }).success).toBe(false);
  });
});

describe('updateGoalSchema', () => {
  it('applies the same target rules', () => {
    expect(updateGoalSchema.safeParse({ targetValue: -1 }).success).toBe(false);
    expect(updateGoalSchema.safeParse({ targetDate: isoDate(-10) }).success).toBe(false);
    expect(updateGoalSchema.safeParse({ targetValue: 65, targetDate: isoDate(7) }).success).toBe(true);
  });
});
