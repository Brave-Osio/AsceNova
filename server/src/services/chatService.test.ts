import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, generateCoachReply } = vi.hoisted(() => ({
  prismaMock: {
    chatMessage: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
  },
  generateCoachReply: vi.fn(),
}));

vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));
vi.mock('../lib/gemini.js', () => ({ generateCoachReply }));
vi.mock('./coachContextService.js', () => ({
  getUserContext: vi.fn().mockResolvedValue({}),
  formatContextAsPromptText: vi.fn().mockReturnValue('context'),
}));

const { sendMessage } = await import('./chatService.js');

describe('chatService.sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.chatMessage.findMany.mockResolvedValue([]);
    prismaMock.chatMessage.create.mockResolvedValue({ id: 'reply', role: 'ASSISTANT' });
    generateCoachReply.mockResolvedValue('A reply');
  });

  it('stores the user message and the reply on a normal send', async () => {
    await sendMessage('u1', 'Hello');
    expect(prismaMock.chatMessage.create).toHaveBeenCalledTimes(2);
    expect(prismaMock.chatMessage.create.mock.calls[0][0].data).toMatchObject({ role: 'USER', message: 'Hello' });
  });

  it('does not store the user message again when retrying an unanswered one', async () => {
    prismaMock.chatMessage.findFirst.mockResolvedValue({ role: 'USER', message: 'Hello' });
    await sendMessage('u1', 'Hello', true);
    expect(prismaMock.chatMessage.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.chatMessage.create.mock.calls[0][0].data).toMatchObject({ role: 'ASSISTANT' });
  });

  it('stores the message on retry when the last stored message is not that unanswered one', async () => {
    prismaMock.chatMessage.findFirst.mockResolvedValue({ role: 'ASSISTANT', message: 'Earlier reply' });
    await sendMessage('u1', 'Hello', true);
    expect(prismaMock.chatMessage.create).toHaveBeenCalledTimes(2);
  });

  it('leaves the saved user message in place when generation fails', async () => {
    generateCoachReply.mockRejectedValue(new Error('upstream down'));
    await expect(sendMessage('u1', 'Hello')).rejects.toThrow('upstream down');
    expect(prismaMock.chatMessage.create).toHaveBeenCalledTimes(1);
  });
});
