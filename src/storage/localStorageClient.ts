/**
 * Generic localStorage client.
 *
 * This is the ONLY file in the entire project allowed to call
 * window.localStorage directly. Every typed storage module
 * (profileStorage, logStorage, etc.) goes through these three
 * functions instead.
 *
 * Why this matters for the future migration: when Postgres/Prisma
 * arrives, this file is the one place that changes shape — the typed
 * storage modules keep their exact function signatures and just call
 * an API client instead of this one. No feature or page code changes.
 *
 * Reads never throw. A missing or corrupted key is treated as "no
 * data yet", which every feature already has to handle for new users.
 */

export function getItem<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[localStorageClient] Failed to read key "${key}":`, error);
    return null;
  }
}

export function setItem<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[localStorageClient] Failed to write key "${key}":`, error);
    return false;
  }
}

export function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`[localStorageClient] Failed to remove key "${key}":`, error);
  }
}
