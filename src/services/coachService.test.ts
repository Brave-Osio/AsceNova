import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpClient } from '../lib/httpClient';
import { getChatHistory, sendCoachMessage } from './coachService';

vi.mock('../lib/httpClient', () => ({
  httpClient: { get: vi.fn(), post: vi.fn() },
}));

describe('coachService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps chat history from USER/ASSISTANT roles to user/coach senders', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: {
        messages: [
          { id: '1', role: 'USER', message: 'Hi', createdAt: '2026-01-01T00:00:00.000Z' },
          { id: '2', role: 'ASSISTANT', message: 'Hello!', createdAt: '2026-01-01T00:00:01.000Z' },
        ],
      },
    });

    const result = await getChatHistory();

    expect(httpClient.get).toHaveBeenCalledWith('/api/chat/history');
    expect(result).toEqual([
      { id: '1', sender: 'user', text: 'Hi' },
      { id: '2', sender: 'coach', text: 'Hello!' },
    ]);
  });

  it('sends a message and maps the assistant reply', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: {
        message: { id: '3', role: 'ASSISTANT', message: 'Great question!', createdAt: '2026-01-01T00:00:02.000Z' },
      },
    });

    const result = await sendCoachMessage('How much protein should I eat?');

    expect(httpClient.post).toHaveBeenCalledWith('/api/chat', { message: 'How much protein should I eat?' });
    expect(result).toEqual({ id: '3', sender: 'coach', text: 'Great question!' });
  });
});
