import { describe, expect, it } from 'vitest';
import { bucketSeries } from './analyticsRange';

const makeDays = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    date: new Date(Date.UTC(2026, 0, 1) + i * 86_400_000).toISOString().slice(0, 10),
    value: 1,
  }));

describe('bucketSeries', () => {
  it('daily keeps only the latest 30 days', () => {
    const out = bucketSeries(makeDays(180), 'daily');
    expect(out).toHaveLength(30);
    expect(out[0].label).toBe('05-31');
  });

  it('weekly sums 7-day buckets over 12 weeks', () => {
    const out = bucketSeries(makeDays(180), 'weekly');
    expect(out).toHaveLength(12);
    expect(out.every((p) => p.value === 7)).toBe(true);
  });

  it('weekly keeps a partial oldest week for a short history', () => {
    const out = bucketSeries(makeDays(10), 'weekly');
    expect(out.map((p) => p.value)).toEqual([3, 7]);
  });

  it('monthly groups by calendar month, capped at 6', () => {
    const out = bucketSeries(makeDays(180), 'monthly');
    expect(out).toHaveLength(6);
    expect(out[0]).toEqual({ label: '2026-01', value: 31 });
  });

  it('last mode returns each bucket\'s final value (running totals)', () => {
    const days = makeDays(14).map((d, i) => ({ ...d, value: i }));
    expect(bucketSeries(days, 'weekly', 'last').map((p) => p.value)).toEqual([6, 13]);
  });
});
