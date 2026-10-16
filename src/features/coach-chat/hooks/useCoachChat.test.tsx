// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { getChatHistory, sendCoachMessage } = vi.hoisted(() => ({
  getChatHistory: vi.fn(),
  sendCoachMessage: vi.fn(),
}));

vi.mock('../../../services/coachService', () => ({ getChatHistory, sendCoachMessage }));
vi.mock('../../../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));

const { useCoachChat } = await import('./useCoachChat');

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useCoachChat failure and retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getChatHistory.mockResolvedValue([]);
  });
  afterEach(cleanup);

  it('surfaces a failure, then retries without duplicating the user message', async () => {
    sendCoachMessage.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce({ id: 'c1', sender: 'coach', text: 'Hi there' });
    const { result } = renderHook(() => useCoachChat(), { wrapper });
    await waitFor(() => expect(getChatHistory).toHaveBeenCalled());

    await act(() => result.current.sendMessage('Hello'));
    expect(result.current.sendError).toBeTruthy();
    expect(result.current.canRetry).toBe(true);
    expect(result.current.messages.filter((m) => m.sender === 'user')).toHaveLength(1);

    await act(() => result.current.retry());
    expect(sendCoachMessage).toHaveBeenLastCalledWith('Hello', true);
    expect(result.current.sendError).toBeNull();
    expect(result.current.canRetry).toBe(false);
    expect(result.current.messages.filter((m) => m.sender === 'user')).toHaveLength(1);
    expect(result.current.messages.filter((m) => m.sender === 'coach')).toHaveLength(1);
  });

  it('ignores a second send while one is in flight', async () => {
    let resolveSend: (v: unknown) => void = () => {};
    sendCoachMessage.mockReturnValue(new Promise((resolve) => (resolveSend = resolve)));
    const { result } = renderHook(() => useCoachChat(), { wrapper });
    await waitFor(() => expect(getChatHistory).toHaveBeenCalled());

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.sendMessage('One');
      void result.current.sendMessage('Two');
    });
    expect(sendCoachMessage).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveSend({ id: 'c1', sender: 'coach', text: 'ok' });
      await first;
    });
  });
});
