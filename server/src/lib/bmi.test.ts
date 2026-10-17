import { describe, it, expect } from 'vitest';
import { calculateBmi } from './bmi.js';

describe('calculateBmi', () => {
  it('computes kg / m² rounded to one decimal', () => {
    expect(calculateBmi(180, 81)).toEqual({ value: 25, category: 'OVERWEIGHT' });
    expect(calculateBmi(170, 65)).toEqual({ value: 22.5, category: 'NORMAL' });
  });

  it('applies the standard category boundaries', () => {
    expect(calculateBmi(100, 18.4)?.category).toBe('UNDERWEIGHT');
    expect(calculateBmi(100, 18.5)?.category).toBe('NORMAL');
    expect(calculateBmi(100, 24.9)?.category).toBe('NORMAL');
    expect(calculateBmi(100, 25)?.category).toBe('OVERWEIGHT');
    expect(calculateBmi(100, 30)?.category).toBe('OBESE');
  });

  it('returns null for missing, zero, negative, malformed or non-finite values', () => {
    expect(calculateBmi(undefined, 70)).toBeNull();
    expect(calculateBmi(170, null)).toBeNull();
    expect(calculateBmi(0, 70)).toBeNull();
    expect(calculateBmi(170, 0)).toBeNull();
    expect(calculateBmi(-170, 70)).toBeNull();
    expect(calculateBmi(170, -70)).toBeNull();
    expect(calculateBmi('170', '70')).toBeNull();
    expect(calculateBmi(NaN, 70)).toBeNull();
    expect(calculateBmi(170, Infinity)).toBeNull();
  });

  it('rejects implausible magnitudes', () => {
    expect(calculateBmi(5, 70)).toBeNull();
    expect(calculateBmi(170, 5000)).toBeNull();
  });
});
