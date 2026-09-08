/**
 * Returns today's date as YYYY-MM-DD (local time), matching the format
 * DailyLogEntry.date is stored in. Centralizing "what counts as today"
 * here means callers never construct Date strings themselves.
 */
export function getTodayDateString(): string {
  return toDateString(new Date());
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Number of whole calendar days between two YYYY-MM-DD strings.
 * Positive when `to` is after `from`. Used to detect whether a streak
 * continues (diff === 1), is the same day (diff === 0), or is broken (diff > 1).
 */
export function daysBetween(fromDateString: string, toDateString: string): number {
  const from = new Date(fromDateString + 'T00:00:00');
  const to = new Date(toDateString + 'T00:00:00');
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}
