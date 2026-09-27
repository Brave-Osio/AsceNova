import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getChatHistory, sendCoachMessage } from '../../../services/coachService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast } from '../../../lib/toast';
import type { ChatMessage } from '../types';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'coach',
  text: "Hi! I'm your AI Fitness Coach. Ask me about workouts, nutrition, or how XP and ranks work.",
};

/** Mirrors the web app's useCoachChat.ts exactly. */
export function useCoachChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const historyQuery = useQuery({
    queryKey: queryKeys.coach.history(user?.id ?? ''),
    queryFn: getChatHistory,
    enabled: !!user?.id,
  });

  const history = historyQuery.data ?? [];
  const messages = history.length > 0 || pendingMessages.length > 0 ? [...history, ...pendingMessages] : [WELCOME_MESSAGE];

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !user) return;

    const userMessage: ChatMessage = { id: `pending-user-${Date.now()}`, sender: 'user', text: trimmed };
    setPendingMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const coachMessage = await sendCoachMessage(trimmed);
      queryClient.setQueryData<ChatMessage[]>(queryKeys.coach.history(user.id), (prev) => [
        ...(prev ?? []),
        userMessage,
        coachMessage,
      ]);
      setPendingMessages([]);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsThinking(false);
    }
  }

  return { messages, isThinking, sendMessage };
}
