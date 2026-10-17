// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useToday } from './useToday';

function setup() {
  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...renderHook(() => useToday(), { wrapper }), invalidate };
}

describe('useToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 19, 23, 59, 30)); // local Mon 23:59:30
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('starts as the current local day', () => {
    expect(setup().result.current).toBe('2026-10-19');
  });

  it('rolls over to the new day at local midnight without a refresh, and refetches per-day data', () => {
    const { result, invalidate } = setup();

    act(() => {
      vi.advanceTimersByTime(45_000); // past midnight
    });

    expect(result.current).toBe('2026-10-20');
    const keys = invalidate.mock.calls.map((c) => (c[0] as { queryKey: string[] }).queryKey[0]);
    expect(keys).toEqual(expect.arrayContaining(['logs', 'workout-day', 'progress']));
  });

  it('catches up when the tab regains focus after the machine slept through midnight', () => {
    const { result } = setup();

    // Timers don't fire while asleep: jump the clock without running them, then focus the window.
    vi.setSystemTime(new Date(2026, 9, 21, 8, 0, 0));
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(result.current).toBe('2026-10-21');
  });

  it('does not invalidate anything while the day is unchanged', () => {
    const { invalidate } = setup();
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
