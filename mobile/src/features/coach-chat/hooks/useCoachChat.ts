import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getChatHistory, sendCoachMessage } from '../../../services/coachService';
import { queryKeys } from '../../../lib/queryKeys';
import { getErrorMessage } from '../../../lib/errors';
import type { ChatMessage } from '../types';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'coach',
  text: "Hi! I'm your AI Fitness Coach. Ask me about workouts, nutrition, or how XP and ranks work.",
};

export interface UseCoachChat {
  messages: ChatMessage[];
  isThinking: boolean;
  /** Message from the last failed request; cleared when a new request starts. */
  sendError: string | null;
  /** True when the newest message is the user's and no request is running, so a retry makes sense. */
  canRetry: boolean;
  sendMessage: (text: string) => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * Backend-driven chat: history is loaded from GET /api/chat/history and
 * cached under queryKeys.coach.history; sending a message optimistically
 * shows the user's text immediately (held in local `pendingMessages`
 * until it is committed into the cache with the coach's reply).
 *
 * There is no secondary AI provider, so when the request fails the chat
 * shows an honest error with a Retry action instead of faking a reply.
 * Retrying re-asks the same text with `retry: true`, which tells the
 * backend not to store the user's message a second time. `inFlight` is a
 * ref (not state) so rapid double-submits can't start two requests.
 */
export function useCoachChat(): UseCoachChat {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const historyQuery = useQuery({
    queryKey: queryKeys.coach.history(user?.id ?? ''),
    queryFn: getChatHistory,
    enabled: !!user?.id,
  });

  const history = historyQuery.data ?? [];
  const messages = history.length > 0 || pendingMessages.length > 0 ? [...history, ...pendingMessages] : [WELCOME_MESSAGE];
  const lastMessage = messages[messages.length - 1];
  const canRetry = !isThinking && lastMessage.id !== 'welcome' && lastMessage.sender === 'user';

  async function submit(text: string, isRetry: boolean) {
    const trimmed = text.trim();
    if (!trimmed || !user || inFlight.current) return;
    inFlight.current = true;

    const userMessage: ChatMessage | null = isRetry
      ? null
      : { id: `pending-user-${Date.now()}`, sender: 'user', text: trimmed };
    if (userMessage) setPendingMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setSendError(null);

    try {
      const coachMessage = await sendCoachMessage(trimmed, isRetry);
      const committed = userMessage ? [...pendingMessages, userMessage] : pendingMessages;
      queryClient.setQueryData<ChatMessage[]>(queryKeys.coach.history(user.id), (prev) => [
        ...(prev ?? []),
        ...committed,
        coachMessage,
      ]);
      setPendingMessages([]);
    } catch (err) {
      setSendError(getErrorMessage(err, 'The coach could not reply. Please try again.'));
    } finally {
      setIsThinking(false);
      inFlight.current = false;
    }
  }

  async function sendMessage(text: string) {
    await submit(text, false);
  }

  async function retry() {
    if (!canRetry) return;
    await submit(lastMessage.text, true);
  }

  return { messages, isThinking, sendError, canRetry, sendMessage, retry };
}
