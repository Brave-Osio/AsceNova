import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function read(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Per-user, per-browser "hidden" list for cards (goals, challenges). Hiding is
 * a display preference only: nothing is changed or deleted on the server, so
 * a hidden goal or challenge keeps counting exactly as before. Stored in
 * localStorage (wrapped in try/catch: it can be unavailable) under a key that
 * includes the user id so accounts sharing a browser don't share a list.
 */
export function useHiddenIds(namespace: string) {
  const { user } = useAuth();
  const key = `hidden:${namespace}:${user?.id ?? 'anon'}`;
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => read(key));

  const persist = useCallback(
    (next: string[]) => {
      setHiddenIds(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage unavailable: the list just won't survive a reload.
      }
    },
    [key],
  );

  const hide = (id: string) => persist(hiddenIds.includes(id) ? hiddenIds : [...hiddenIds, id]);
  const unhide = (id: string) => persist(hiddenIds.filter((h) => h !== id));
  const isHidden = (id: string) => hiddenIds.includes(id);

  return { hiddenIds, hide, unhide, isHidden };
}
