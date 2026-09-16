import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prismaClient.js';
import { generateCoachReply } from '../lib/gemini.js';
import { getUserContext, formatContextAsPromptText } from './coachContextService.js';

export const COACH_PROMPT_VERSION = 'coach-gemini-v1';

const HISTORY_TURNS = 10;

const SYSTEM_PROMPT_PREFIX = [
  "You are AsceNova's AI Fitness Coach — a knowledgeable, encouraging personal trainer and nutrition coach.",
  'You are talking to one specific user. Use the real data below to make your answers personal and specific',
  '(reference their actual streak, XP, plan, or recent progress when relevant) rather than generic advice.',
  'Keep answers focused and actionable — a few short paragraphs, not an essay. If the data below is missing',
  'something you need, say so plainly and give general evidence-based guidance instead of guessing.',
].join(' ');

export async function getHistory(userId: string, limit = 50) {
  return prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

/**
 * Persists the user's message, gathers their real profile/plan/progress
 * context, calls Gemini with recent chat history for continuity, then
 * persists and returns the assistant's reply. If Gemini fails, the
 * user's message is already saved — nothing is lost, and no canned
 * fallback reply is generated in its place.
 */
export async function sendMessage(userId: string, message: string) {
  await prisma.chatMessage.create({ data: { userId, role: 'USER', message } });

  const [context, priorMessages] = await Promise.all([
    getUserContext(userId),
    prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_TURNS + 1,
      skip: 1,
    }),
  ]);

  const systemPrompt = `${SYSTEM_PROMPT_PREFIX}\n\n${formatContextAsPromptText(context)}`;
  const history = priorMessages
    .reverse()
    .map((m) => ({ role: m.role === 'ASSISTANT' ? ('model' as const) : ('user' as const), text: m.message }));

  const replyText = await generateCoachReply(systemPrompt, history, message);

  return prisma.chatMessage.create({
    data: {
      userId,
      role: 'ASSISTANT',
      message: replyText,
      contextSnapshot: context as unknown as Prisma.InputJsonValue,
      promptVersion: COACH_PROMPT_VERSION,
    },
  });
}
