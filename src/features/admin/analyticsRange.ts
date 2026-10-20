export type AnalyticsRange = 'daily' | 'weekly' | 'monthly';

export const RANGE_OPTIONS: { value: AnalyticsRange; label: string; window: string }[] = [
  { value: 'daily', label: 'Daily', window: 'past 30 days' },
  { value: 'weekly', label: 'Weekly', window: 'past 12 weeks' },
  { value: 'monthly', label: 'Monthly', window: 'past 6 months' },
];

export interface SeriesPoint {
  label: string;
  value: number;
}

const DAILY_DAYS = 30;
const WEEKLY_BUCKETS = 12;
const MONTHLY_BUCKETS = 6;

/** "2026-09-30" -> "09-30", matching the charts' compact axis labels. */
const shortDate = (iso: string) => iso.slice(5);

/**
 * Re-buckets the server's oldest-first per-day series into the selected range.
 * `sum` adds the days in a bucket (counts); `last` takes the bucket's final day (running totals).
 * Weeks end today, so the newest bucket is always the last 7 days; months are UTC calendar months.
 */
export function bucketSeries(
  days: { date: string; value: number }[],
  range: AnalyticsRange,
  mode: 'sum' | 'last' = 'sum',
): SeriesPoint[] {
  if (range === 'daily') {
    return days.slice(-DAILY_DAYS).map((d) => ({ label: shortDate(d.date), value: d.value }));
  }

  const groups: { label: string; values: number[] }[] = [];
  if (range === 'weekly') {
    const windowed = days.slice(-WEEKLY_BUCKETS * 7);
    const offset = windowed.length % 7; // a short history leaves a partial oldest week
    for (let i = 0; i < windowed.length; ) {
      const size = i === 0 && offset > 0 ? offset : 7;
      const chunk = windowed.slice(i, i + size);
      groups.push({ label: shortDate(chunk[0].date), values: chunk.map((d) => d.value) });
      i += size;
    }
  } else {
    const byMonth = new Map<string, number[]>();
    for (const d of days) {
      const month = d.date.slice(0, 7);
      byMonth.set(month, [...(byMonth.get(month) ?? []), d.value]);
    }
    for (const [month, values] of Array.from(byMonth).slice(-MONTHLY_BUCKETS)) groups.push({ label: month, values });
  }

  return groups.map((g) => ({
    label: g.label,
    value: mode === 'last' ? g.values[g.values.length - 1] : g.values.reduce((sum, v) => sum + v, 0),
  }));
}
