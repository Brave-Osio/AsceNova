import { useState } from 'react';
import { askCoach } from '../../../services/coachService';
import type { ChatMessage } from '../types';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'coach',
  text: "Hi! I'm your AI Fitness Coach. Ask me about workouts, nutrition, or how XP and ranks work.",
};

export function useCoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isThinking, setIsThinking] = useState(false);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { id: `user_${Date.now()}`, sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    const response = await askCoach(trimmed);

    const coachMessage: ChatMessage = {
      id: `coach_${Date.now()}`,
      sender: 'coach',
      text: response,
    };
    setMessages((prev) => [...prev, coachMessage]);
    setIsThinking(false);
  }

  return { messages, isThinking, sendMessage };
}
