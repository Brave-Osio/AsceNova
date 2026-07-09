import { describe, it, expect } from 'vitest';
import { getRankForXp, getNextRankThreshold, getRankProgress } from './rankEngine';

describe('rankEngine.getRankForXp', () => {
  it('returns Iron at 0 XP', () => {
    expect(getRankForXp(0)).toBe('Iron');
  });

  it('returns Iron just below the Bronze threshold', () => {
    expect(getRankForXp(499)).toBe('Iron');
  });

  it('returns Bronze exactly at its threshold (inclusive lower bound)', () => {
    expect(getRankForXp(500)).toBe('Bronze');
  });

  it('returns Bronze one above its threshold', () => {
    expect(getRankForXp(501)).toBe('Bronze');
  });

  it('returns Silver exactly at its threshold', () => {
    expect(getRankForXp(1500)).toBe('Silver');
  });

  it('returns Radiant exactly at its threshold', () => {
    expect(getRankForXp(25000)).toBe('Radiant');
  });

  it('returns Radiant for XP far beyond the highest threshold', () => {
    expect(getRankForXp(999999)).toBe('Radiant');
  });

  it('handles negative XP defensively by returning the lowest rank', () => {
    expect(getRankForXp(-100)).toBe('Iron');
  });
});

describe('rankEngine.getNextRankThreshold', () => {
  it('returns Bronze as the next rank when at Iron', () => {
    expect(getNextRankThreshold(0)?.name).toBe('Bronze');
  });

  it('returns null when already at the highest rank', () => {
    expect(getNextRankThreshold(25000)).toBeNull();
  });

  it('returns null for XP far beyond Radiant', () => {
    expect(getNextRankThreshold(999999)).toBeNull();
  });
});

describe('rankEngine.getRankProgress', () => {
  it('returns 0 at the exact start of a rank', () => {
    expect(getRankProgress(500)).toBe(0);
  });

  it('returns 0.5 at the midpoint between Bronze and Silver', () => {
    // Bronze: 500, Silver: 1500 -> midpoint is 1000
    expect(getRankProgress(1000)).toBeCloseTo(0.5);
  });

  it('returns 1 (maxed) at Radiant since there is no next rank', () => {
    expect(getRankProgress(25000)).toBe(1);
  });
});
