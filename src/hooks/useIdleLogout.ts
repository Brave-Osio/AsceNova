import { useCallback, useEffect, useRef, useState } from 'react';

export const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
/** How long before the logout the "still there?" warning appears. */
export const IDLE_WARNING_MS = 30 * 1000;

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;
const CHECK_INTERVAL_MS = 1000;

/**
 * Warns after `IDLE_TIMEOUT_MS - IDLE_WARNING_MS` without user input, then calls `onIdle` once
 * `IDLE_TIMEOUT_MS` is reached, while `enabled`. Once the warning is up, ordinary input no longer
 * resets the clock — the user has to confirm with `stayActive()`, so a stray mouse move can't
 * silently dismiss it.
 * Compares timestamps on a short interval instead of one long setTimeout, because browsers throttle
 * timers in background tabs and suspended laptops would otherwise stay signed in well past the limit.
 */
export function useIdleLogout(enabled: boolean, onIdle: () => void) {
  const onIdleRef = useRef(onIdle);
  const lastActivity = useRef(0);
  const warningRef = useRef(false);
  const [isWarning, setIsWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const stayActive = useCallback(() => {
    lastActivity.current = Date.now();
    warningRef.current = false;
    setIsWarning(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    lastActivity.current = Date.now();
    warningRef.current = false;

    const markActive = () => {
      if (!warningRef.current) lastActivity.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, markActive, { passive: true }));

    const interval = window.setInterval(() => {
      const idleFor = Date.now() - lastActivity.current;
      if (idleFor >= IDLE_TIMEOUT_MS) {
        window.clearInterval(interval);
        warningRef.current = false;
        setIsWarning(false);
        onIdleRef.current();
      } else if (idleFor >= IDLE_TIMEOUT_MS - IDLE_WARNING_MS) {
        warningRef.current = true;
        setIsWarning(true);
        setSecondsLeft(Math.ceil((IDLE_TIMEOUT_MS - idleFor) / 1000));
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, markActive));
      window.clearInterval(interval);
      warningRef.current = false;
      setIsWarning(false);
    };
  }, [enabled]);

  return { isWarning: enabled && isWarning, secondsLeft, stayActive };
}
