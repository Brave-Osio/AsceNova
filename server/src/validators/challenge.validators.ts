import { z } from 'zod';

export const createChallengeInviteSchema = z.object({
  challengeId: z.string().min(1),
  inviteeUsernames: z.array(z.string().trim().toLowerCase().min(1).max(254)).max(10).default([]),
});
export type CreateChallengeInviteInput = z.infer<typeof createChallengeInviteSchema>;

export const respondToChallengeInviteSchema = z.object({
  accept: z.boolean(),
});
export type RespondToChallengeInviteInput = z.infer<typeof respondToChallengeInviteSchema>;
