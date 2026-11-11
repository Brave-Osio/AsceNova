import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 1000;

/**
 * Calls `onIdle` once after `IDLE_TIMEOUT_MS` without a touch while `enabled`.
 * Attach the returned `onTouchStart` to a root View that wraps the app (touch
 * events bubble, so children don't need to opt in). Elapsed time is measured
 * from timestamps, so time spent backgrounded counts and the check also runs
 * immediately when the app returns to the foreground (JS timers are paused
 * while backgrounded).
 */
export function useIdleLogout(enabled: boolean, onIdle: () => void) {
  const lastActivity = useRef(0); // set to Date.now() in the effect below, once enabled
  const onIdleRef = useRef(onIdle);
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const onTouchStart = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    lastActivity.current = Date.now();

    let fired = false;
    const check = () => {
      if (!fired && Date.now() - lastActivity.current >= IDLE_TIMEOUT_MS) {
        fired = true;
        onIdleRef.current();
      }
    };
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [enabled]);

  return { onTouchStart };
}
