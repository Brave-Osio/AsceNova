import { httpClient } from '../lib/httpClient';
import type { ChatMessage } from '../features/coach-chat/types';

interface ApiChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  message: string;
  createdAt: string;
}

function toChatMessage(api: ApiChatMessage): ChatMessage {
  return {
    id: api.id,
    sender: api.role === 'USER' ? 'user' : 'coach',
    text: api.message,
  };
}

/** Mirrors the web app's src/services/coachService.ts. */
export async function getChatHistory(): Promise<ChatMessage[]> {
  const res = await httpClient.get<{ messages: ApiChatMessage[] }>('/api/chat/history');
  return res.data.messages.map(toChatMessage);
}

/**
 * `retry` tells the backend this text was already saved by an earlier failed attempt, so it must not
 * store the user's message a second time.
 */
export async function sendCoachMessage(message: string, retry = false): Promise<ChatMessage> {
  const res = await httpClient.post<{ message: ApiChatMessage }>('/api/chat', retry ? { message, retry: true } : { message });
  return toChatMessage(res.data.message);
}
