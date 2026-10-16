// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';

const auth = vi.hoisted(() => ({ userId: 'u1' }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: auth.userId } }) }));

const { useHiddenIds } = await import('./useHiddenIds');

describe('useHiddenIds', () => {
  beforeEach(() => {
    localStorage.clear();
    auth.userId = 'u1';
  });
  afterEach(cleanup);

  it('hides and unhides ids and persists them per user', () => {
    const { result, unmount } = renderHook(() => useHiddenIds('goals'));
    act(() => result.current.hide('g1'));
    expect(result.current.isHidden('g1')).toBe(true);
    unmount();

    const again = renderHook(() => useHiddenIds('goals'));
    expect(again.result.current.isHidden('g1')).toBe(true);
    act(() => again.result.current.unhide('g1'));
    expect(again.result.current.isHidden('g1')).toBe(false);
  });

  it('does not share the list between users or namespaces', () => {
    const a = renderHook(() => useHiddenIds('goals'));
    act(() => a.result.current.hide('x'));
    a.unmount();

    expect(renderHook(() => useHiddenIds('challenges')).result.current.isHidden('x')).toBe(false);
    auth.userId = 'u2';
    expect(renderHook(() => useHiddenIds('goals')).result.current.isHidden('x')).toBe(false);
  });

  it('ignores corrupt stored data', () => {
    localStorage.setItem('hidden:goals:u1', '{not json');
    expect(renderHook(() => useHiddenIds('goals')).result.current.hiddenIds).toEqual([]);
  });
});
