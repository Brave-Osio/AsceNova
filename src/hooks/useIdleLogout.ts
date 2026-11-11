import { useEffect, useRef } from 'react';

export const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;
const CHECK_INTERVAL_MS = 1000;

/**
 * Calls `onIdle` once after `IDLE_TIMEOUT_MS` without user input while `enabled`.
 * Compares timestamps on a short interval instead of one long setTimeout, because
 * browsers throttle timers in background tabs and suspended laptops would otherwise
 * stay signed in well past the limit.
 */
export function useIdleLogout(enabled: boolean, onIdle: () => void) {
  const onIdleRef = useRef(onIdle);
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return;

    let lastActivity = Date.now();
    const markActive = () => {
      lastActivity = Date.now();
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, markActive, { passive: true }));

    const interval = window.setInterval(() => {
      if (Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        window.clearInterval(interval);
        onIdleRef.current();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, markActive));
      window.clearInterval(interval);
    };
  }, [enabled]);
}
