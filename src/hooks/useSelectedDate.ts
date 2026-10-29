import { useCallback, useSyncExternalStore } from 'react';
import { useToday } from './useToday';

/**
 * The day the user is looking at on the Daily Log and the dashboard's "Today's Target" card.
 * null = "follow today", so a page left open past midnight moves on to the new day by itself.
 * Kept at module level (not component state) so both pages read the same pick without a provider;
 * it resets on a full page reload, which is the intended "back to today" default.
 */
let picked: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return picked;
}

export function useSelectedDate() {
  const today = useToday();
  const pickedDate = useSyncExternalStore(subscribe, getSnapshot);
  // A pick in the future (e.g. left over from yesterday's tab) falls back to today.
  const selectedDate = pickedDate && pickedDate <= today ? pickedDate : today;

  const setSelectedDate = useCallback((date: string | null) => {
    picked = date;
    listeners.forEach((listener) => listener());
  }, []);

  return { today, selectedDate, isToday: selectedDate === today, setSelectedDate };
}
