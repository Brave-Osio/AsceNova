import { z } from 'zod';

export const createChallengeInviteSchema = z.object({
  challengeId: z.string().min(1),
  inviteeEmails: z.array(z.string().trim().toLowerCase().email()).max(10).default([]),
});
export type CreateChallengeInviteInput = z.infer<typeof createChallengeInviteSchema>;

export const respondToChallengeInviteSchema = z.object({
  accept: z.boolean(),
});
export type RespondToChallengeInviteInput = z.infer<typeof respondToChallengeInviteSchema>;
