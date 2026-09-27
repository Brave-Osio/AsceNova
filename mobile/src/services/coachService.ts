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

export async function sendCoachMessage(message: string): Promise<ChatMessage> {
  const res = await httpClient.post<{ message: ApiChatMessage }>('/api/chat', { message });
  return toChatMessage(res.data.message);
}
