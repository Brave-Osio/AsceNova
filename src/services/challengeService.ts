import { httpClient } from '../lib/httpClient';
import type { ChallengeInvite, ChallengeTemplate } from '../types/challenge.types';

/**
 * Thin wrapper over /api/challenges, mirroring notificationService.ts's
 * "one exported function per concern" convention.
 */
export async function getChallengeCatalog(): Promise<ChallengeTemplate[]> {
  const res = await httpClient.get<{ challenges: ChallengeTemplate[] }>('/api/challenges/catalog');
  return res.data.challenges;
}

export async function getMyChallenges(): Promise<ChallengeInvite[]> {
  const res = await httpClient.get<{ invites: ChallengeInvite[] }>('/api/challenges/mine');
  return res.data.invites;
}

export async function createChallenge(input: { challengeId: string; inviteeEmails: string[] }): Promise<ChallengeInvite> {
  const res = await httpClient.post<{ invite: ChallengeInvite }>('/api/challenges', input);
  return res.data.invite;
}

export async function respondToChallengeInvite(inviteId: string, accept: boolean): Promise<void> {
  await httpClient.post(`/api/challenges/${inviteId}/respond`, { accept });
}
