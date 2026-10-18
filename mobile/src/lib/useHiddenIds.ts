import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

async function read(key: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Mirrors the web's useHiddenIds. Per-user, per-device "hidden" list for cards (goals, challenges).
 * Hiding is a display preference only: nothing is changed or deleted on the server, so a hidden goal or
 * challenge keeps counting exactly as before. Stored in AsyncStorage under a key that includes the user id
 * so accounts sharing a device don't share a list.
 */
export function useHiddenIds(namespace: string) {
  const { user } = useAuth();
  const key = `hidden:${namespace}:${user?.id ?? 'anon'}`;
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    read(key).then((ids) => {
      if (!cancelled) setHiddenIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const persist = useCallback(
    (next: string[]) => {
      setHiddenIds(next);
      AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {
        // Storage unavailable: the list just won't survive an app restart.
      });
    },
    [key],
  );

  const hide = (id: string) => persist(hiddenIds.includes(id) ? hiddenIds : [...hiddenIds, id]);
  const unhide = (id: string) => persist(hiddenIds.filter((h) => h !== id));
  const isHidden = (id: string) => hiddenIds.includes(id);

  return { hiddenIds, hide, unhide, isHidden };
}
