import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getTodayDateString } from '../utils/dateUtils';

/** Milliseconds until the next local midnight (plus a small margin so the clock has definitely rolled over). */
function msUntilNextLocalMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}

/**
 * The current local calendar day (YYYY-MM-DD), kept correct for as long as the page stays open.
 *
 * "Today" used to be computed once per render, so a dashboard left open overnight — or a laptop
 * woken the next morning — kept showing yesterday's progress until a manual refresh. This hook
 * re-reads the clock at local midnight AND whenever the tab becomes visible/focused again (timers
 * are throttled or paused while a tab is hidden or the machine sleeps). When the day changes it
 * invalidates the per-day queries so they refetch from the server, which is the source of truth;
 * nothing is deleted — yesterday's records remain in the history views.
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

    const timer = window.setTimeout(sync, msUntilNextLocalMidnight());
    function handleVisibility() {
      if (document.visibilityState === 'visible') sync();
    }
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // Re-arm the midnight timer each time the day changes.
  }, [today, queryClient]);

  return today;
}
