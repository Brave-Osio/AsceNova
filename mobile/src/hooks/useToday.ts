import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { getTodayDateString } from '../utils/dateUtils';

/** Milliseconds until the next local midnight (plus a margin so the clock has definitely rolled over). */
function msUntilNextLocalMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}

/**
 * Mirrors the web app's src/hooks/useToday.ts. The current local calendar day (YYYY-MM-DD), kept
 * correct while the app stays open: re-read at local midnight AND whenever the app returns to the
 * foreground (timers don't run while the app is suspended, e.g. overnight). When the day changes the
 * per-day queries are invalidated so they refetch from the server; nothing is deleted.
 */
export function useToday(): string {
  const queryClient = useQueryClient();
  const [today, setToday] = useState(getTodayDateString);

  useEffect(() => {
    function sync() {
      const current = getTodayDateString();
      setToday((prev) => {
        if (prev === current) return prev;
        queryClient.invalidateQueries({ queryKey: ['logs'] });
        queryClient.invalidateQueries({ queryKey: ['workout-day'] });
        queryClient.invalidateQueries({ queryKey: ['progress'] });
        return current;
      });
    }

    const timer = setTimeout(sync, msUntilNextLocalMidnight());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [today, queryClient]);

  return today;
}
