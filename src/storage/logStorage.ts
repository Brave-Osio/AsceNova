import { getItem, setItem } from './localStorageClient';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { DailyLogEntry, DailyLogInput } from '../types/log.types';

/**
 * Appends a new log entry and returns the full updated list.
 *
 * Note: this does NOT dedupe by date. If a user logs twice in one day,
 * both entries are kept — the engines layer (streakEngine) decides how
 * to interpret "already logged today" when calculating XP/streaks,
 * rather than storage silently overwriting data.
 */
export function saveLog(input: DailyLogInput): DailyLogEntry[] {
  const logs = getLogs();
  const entry: DailyLogEntry = {
    ...input,
    id: `log_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [...logs, entry];
  setItem(STORAGE_KEYS.logs, updated);
  return updated;
}

export function getLogs(): DailyLogEntry[] {
  return getItem<DailyLogEntry[]>(STORAGE_KEYS.logs) ?? [];
}

/** Returns the most recent log entry, or null if none exist yet. */
export function getLatestLog(): DailyLogEntry | null {
  const logs = getLogs();
  if (logs.length === 0) return null;
  return logs[logs.length - 1];
}
