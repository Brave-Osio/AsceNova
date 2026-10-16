import { describe, it, expect } from 'vitest';
import { validateNotPastDate, validateWeightKg } from './validation';

describe('validateWeightKg', () => {
  it('accepts realistic weights', () => {
    expect(validateWeightKg('70')).toBeNull();
    expect(validateWeightKg('72.5')).toBeNull();
    expect(validateWeightKg('30')).toBeNull();
    expect(validateWeightKg('300')).toBeNull();
  });

  it('rejects empty, malformed, negative and out-of-range input', () => {
    expect(validateWeightKg('')).toMatch(/required/);
    expect(validateWeightKg('   ')).toMatch(/required/);
    expect(validateWeightKg('abc')).toMatch(/must be a number/);
    expect(validateWeightKg('Infinity')).toMatch(/must be a number/);
    expect(validateWeightKg('-5')).toMatch(/cannot be negative/);
    expect(validateWeightKg('0')).toMatch(/between 30 and 300/);
    expect(validateWeightKg('29.9')).toMatch(/between 30 and 300/);
    expect(validateWeightKg('99999')).toMatch(/between 30 and 300/);
  });
});

describe('validateNotPastDate', () => {
  it('allows today and future dates', () => {
    expect(validateNotPastDate('2026-10-17', '2026-10-17')).toBeNull();
    expect(validateNotPastDate('2027-01-01', '2026-10-17')).toBeNull();
  });

  it('rejects past and malformed dates', () => {
    expect(validateNotPastDate('2026-10-16', '2026-10-17', 'Target date')).toBe('Target date cannot be in the past.');
    expect(validateNotPastDate('not-a-date', '2026-10-17')).toMatch(/valid date/);
    expect(validateNotPastDate('2026-13-40', '2026-10-17')).toMatch(/valid date/);
  });
});
