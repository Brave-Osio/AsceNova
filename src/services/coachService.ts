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

/**
 * Thin wrapper over the chat API — mirrors progressService.ts's
 * "one exported function per concern" convention. Replaces the old
 * keyword-matching askCoach() mock; the backend now calls Gemini with
 * the user's real profile/plan/progress context.
 */
export async function getChatHistory(): Promise<ChatMessage[]> {
  const res = await httpClient.get<{ messages: ApiChatMessage[] }>('/api/chat/history');
  return res.data.messages.map(toChatMessage);
}

/**
 * `retry` tells the backend this text was already saved by an earlier failed
 * attempt, so it must not store the user's message a second time.
 */
export async function sendCoachMessage(message: string, retry = false): Promise<ChatMessage> {
  const res = await httpClient.post<{ message: ApiChatMessage }>(
    '/api/chat',
    retry ? { message, retry: true } : { message },
  );
  return toChatMessage(res.data.message);
}
