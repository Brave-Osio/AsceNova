import type { Prisma } from '@prisma/client';

/** Anonymised email left on an erased account's tombstone row (reserved .invalid TLD, never routable). */
export const ERASED_EMAIL_DOMAIN = 'deleted.invalid';

export function erasedEmailFor(userId: string): string {
  return `deleted-${userId}@${ERASED_EMAIL_DOMAIN}`;
}

/**
 * Permanently erases everything personal a user owns, in the caller's transaction, and
 * leaves a PII-free "tombstone" user row instead of removing the row itself.
 *
 * Why a tombstone: shared records that must survive one member leaving (a ChallengeInvite
 * the user started, with other people's participation in it; Report/SystemSetting FKs)
 * reference users.id. Deleting the row would cascade-delete other people's data, so the row
 * stays — with a random id, no email/name/credentials, status DELETED — and can't be signed
 * into or recreated.
 *
 * Idempotent: safe to run twice on the same user.
 */
export async function eraseUserData(tx: Prisma.TransactionClient, userId: string): Promise<void> {
  const owned = { where: { userId } };

  // SAFE: account erasure is the one legitimate hard delete — these rows are personal data
  // the user (or the retention policy) requires gone; soft-deleting them would keep PII.
  await tx.refreshToken.deleteMany(owned);
  await tx.passwordResetToken.deleteMany(owned); // SAFE: credential material, erased with the account
  await tx.chatMessage.deleteMany(owned); // SAFE: private AI conversations
  await tx.notification.deleteMany(owned); // SAFE: personal notifications
  await tx.goal.deleteMany(owned); // SAFE: personal goals
  await tx.waterLog.deleteMany(owned); // SAFE: personal health log
  await tx.weightProgress.deleteMany(owned); // SAFE: personal health log
  await tx.workoutLog.deleteMany(owned); // SAFE: personal activity log
  await tx.dailyProgress.deleteMany(owned); // SAFE: personal daily check-ins
  await tx.xpHistory.deleteMany(owned); // SAFE: per-user gamification history
  await tx.rankHistory.deleteMany(owned); // SAFE: per-user gamification history
  await tx.streakHistory.deleteMany(owned); // SAFE: per-user gamification history
  await tx.achievementProgress.deleteMany(owned); // SAFE: per-user unlock records (Achievement definitions are untouched)
  await tx.leaderboardEntry.deleteMany(owned); // SAFE: holds the user's display name
  await tx.userProgress.deleteMany(owned); // SAFE: removes the user from the live leaderboard
  // SAFE: only this user's own participation rows; the Challenge/ChallengeInvite itself and others' rows stay.
  await tx.challengeParticipant.deleteMany(owned);
  await tx.workoutPlan.deleteMany(owned); // SAFE: cascades to the plan's days, exercises and nutrition targets
  await tx.profile.deleteMany(owned); // SAFE: name, birthday, body measurements

  // Soft removal: the tombstone row stays, so end any coaching relationship it was part of.
  await tx.coachAssignment.updateMany({
    where: { OR: [{ coachId: userId }, { clientId: userId }] },
    data: { active: false },
  });

  const existing = await tx.user.findUnique({ where: { id: userId }, select: { deletedAt: true } });
  await tx.user.update({
    where: { id: userId },
    data: {
      email: erasedEmailFor(userId),
      passwordHash: null,
      googleId: null,
      recoveryEmail: null,
      role: 'USER',
      status: 'DELETED',
      deleted: true,
      deletedAt: existing?.deletedAt ?? new Date(),
    },
  });
}
