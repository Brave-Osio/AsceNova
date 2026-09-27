/** Mirrors the web app's src/features/coach-chat/types.ts. */
export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
}

export const SUGGESTED_QUESTIONS: string[] = [
  'Can I workout every day?',
  'How much protein should I eat?',
  'How do I lose fat?',
  'How do I gain muscle?',
  'Is creatine worth taking?',
  'How important is sleep?',
];
