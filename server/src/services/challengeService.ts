import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import * as dailyProgressService from './dailyProgressService.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function getCatalog() {
  return prisma.challenge.findMany({ where: { isActive: true }, orderBy: { title: 'asc' } });
}

const participantInclude = {
  participants: {
    include: {
      user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
    },
  },
  challenge: true,
} as const;

/**
 * Invitees are addressed by username (the `email` column is the login
 * name — see auth.validators.ts). Unlike password reset there is no
 * anti-enumeration posture here: the inviter is logged in and explicitly
 * asked to be told when a username doesn't exist, so the whole request is
 * rejected (nothing is created) if any username can't be resolved.
 */
export async function createInvite(userId: string, challengeId: string, inviteeUsernames: string[]) {
  const challenge = await prisma.challenge.findFirst({ where: { id: challengeId, isActive: true } });
  if (!challenge) {
    throw new HttpError(404, 'Challenge not found');
  }

  const creator = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

  const requested = [...new Set(inviteeUsernames)].filter((name) => name !== creator?.email.toLowerCase());
  const invitees =
    requested.length === 0
      ? []
      : await prisma.user.findMany({
          where: { email: { in: requested, mode: 'insensitive' }, deleted: false, status: 'ACTIVE' },
          select: { id: true, email: true },
        });

  const found = new Set(invitees.map((u) => u.email.toLowerCase()));
  const missing = requested.filter((name) => !found.has(name));
  if (missing.length > 0) {
    const list = missing.map((name) => `"${name}"`).join(', ');
    throw new HttpError(404, missing.length === 1 ? `No user found with username ${list}` : `No users found with usernames ${list}`);
  }

  const now = new Date();
  const periodEnd = new Date(now.getTime() + challenge.periodDays * MS_PER_DAY);

  const invite = await prisma.$transaction(async (tx) => {
    const created = await tx.challengeInvite.create({
      data: {
        challengeId,
        createdByUserId: userId,
        periodStart: now,
        periodEnd,
        participants: {
          create: [
            { userId, status: 'ACCEPTED' },
            ...invitees.map((u) => ({ userId: u.id, status: 'INVITED' as const })),
          ],
        },
      },
    });

    if (invitees.length > 0) {
      await tx.notification.createMany({
        data: invitees.map((u) => ({
          userId: u.id,
          type: 'CHALLENGE_INVITE' as const,
          title: 'Challenge Invite!',
          body: `You've been invited to "${challenge.title}"`,
          metadata: { challengeInviteId: created.id },
        })),
      });
    }

    return created;
  });

  return prisma.challengeInvite.findUniqueOrThrow({ where: { id: invite.id }, include: participantInclude });
}

export async function respondToInvite(userId: string, inviteId: string, accept: boolean) {
  const result = await prisma.challengeParticipant.updateMany({
    where: { challengeInviteId: inviteId, userId, status: 'INVITED' },
    data: { status: accept ? 'ACCEPTED' : 'DECLINED' },
  });
  if (result.count === 0) {
    throw new HttpError(404, 'Invite not found');
  }
}

export async function getMyChallenges(userId: string) {
  const invites = await prisma.challengeInvite.findMany({
    where: { participants: { some: { userId } } },
    include: participantInclude,
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  const expiredIds = invites.filter((i) => i.status === 'ACTIVE' && i.periodEnd < now).map((i) => i.id);
  if (expiredIds.length > 0) {
    await prisma.challengeInvite.updateMany({ where: { id: { in: expiredIds } }, data: { status: 'EXPIRED' } });
  }

  return invites.map((i) => (expiredIds.includes(i.id) ? { ...i, status: 'EXPIRED' as const } : i));
}

/**
 * Called from progressService.applyDailyLog's transaction — recomputes
 * progress for every challenge the user is an ACCEPTED participant in on
 * a still-ACTIVE invite, grants XP + fires a notification the moment a
 * challenge is completed. Same tx client, no separate transaction.
 */
export async function updateChallengeProgress(
  tx: Prisma.TransactionClient,
  userId: string,
  currentStreak: number,
): Promise<{ xpGrants: { amount: number; sourceRefId: string }[]; completedTitles: string[] }> {
  const participations = await tx.challengeParticipant.findMany({
    where: {
      userId,
      status: 'ACCEPTED',
      completedAt: null,
      challengeInvite: { status: 'ACTIVE', periodEnd: { gte: new Date() } },
    },
    include: { challengeInvite: { include: { challenge: true } } },
  });

  const xpGrants: { amount: number; sourceRefId: string }[] = [];
  const completedTitles: string[] = [];

  for (const p of participations) {
    const { challenge } = p.challengeInvite;
    let progressValue: number;
    if (challenge.metric === 'LOG_STREAK') {
      progressValue = currentStreak;
    } else {
      // Upper bound = tomorrow (UTC): tolerates a client whose local date is ahead of UTC, but excludes simulated future days.
      const until = new Date(Date.now() + MS_PER_DAY);
      progressValue = await dailyProgressService.countMetricSince(userId, challenge.metric, p.challengeInvite.periodStart, until);
    }

    const justCompleted = progressValue >= challenge.targetValue;
    await tx.challengeParticipant.update({
      where: { id: p.id },
      data: { progressValue, completedAt: justCompleted ? new Date() : undefined },
    });

    if (justCompleted) {
      xpGrants.push({ amount: challenge.xpReward, sourceRefId: challenge.id });
      completedTitles.push(challenge.title);
      await tx.notification.create({
        data: {
          userId,
          type: 'CHALLENGE_COMPLETED',
          title: 'Challenge Complete!',
          body: `You completed "${challenge.title}"!`,
          metadata: { challengeId: challenge.id },
        },
      });
    }
  }

  return { xpGrants, completedTitles };
}
