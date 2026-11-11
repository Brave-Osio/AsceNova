import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
/** How long before the logout the "still there?" warning appears. */
export const IDLE_WARNING_MS = 30 * 1000;
const CHECK_INTERVAL_MS = 1000;

/**
 * Warns after `IDLE_TIMEOUT_MS - IDLE_WARNING_MS` without a touch, then calls `onIdle` once
 * `IDLE_TIMEOUT_MS` is reached, while `enabled`. Attach the returned `onTouchStart` to a root View
 * that wraps the app (touch events bubble, so children don't need to opt in). Once the warning is
 * up, touches no longer reset the clock — the user must confirm with `stayActive()`.
 * Elapsed time is measured from timestamps, so time spent backgrounded counts and the check also
 * runs immediately when the app returns to the foreground (JS timers are paused while backgrounded).
 */
export function useIdleLogout(enabled: boolean, onIdle: () => void) {
  const lastActivity = useRef(0);
  const warningRef = useRef(false);
  const onIdleRef = useRef(onIdle);
  const [isWarning, setIsWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const onTouchStart = useCallback(() => {
    if (!warningRef.current) lastActivity.current = Date.now();
  }, []);

  const stayActive = useCallback(() => {
    lastActivity.current = Date.now();
    warningRef.current = false;
    setIsWarning(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    lastActivity.current = Date.now();
    warningRef.current = false;

    let fired = false;
    const check = () => {
      if (fired) return;
      const idleFor = Date.now() - lastActivity.current;
      if (idleFor >= IDLE_TIMEOUT_MS) {
        fired = true;
        warningRef.current = false;
        setIsWarning(false);
        onIdleRef.current();
      } else if (idleFor >= IDLE_TIMEOUT_MS - IDLE_WARNING_MS) {
        warningRef.current = true;
        setIsWarning(true);
        setSecondsLeft(Math.ceil((IDLE_TIMEOUT_MS - idleFor) / 1000));
      }
    };
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
      warningRef.current = false;
      setIsWarning(false);
    };
  }, [enabled]);

  return { onTouchStart, isWarning: enabled && isWarning, secondsLeft, stayActive };
}
