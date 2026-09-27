/** Mirrors the web app's src/utils/dateUtils.ts. */
export function getTodayDateString(): string {
  return toDateString(new Date());
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysBetween(fromDateString: string, toDateString: string): number {
  const from = new Date(fromDateString + 'T00:00:00');
  const to = new Date(toDateString + 'T00:00:00');
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}
