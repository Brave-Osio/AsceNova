import { prisma } from '../lib/prismaClient.js';
import { env } from '../config/env.js';
import { eraseUserData, ERASED_EMAIL_DOMAIN } from './userErasureService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const TOKEN_GRACE_DAYS = 7;
/** Accounts erased per run, so one cron invocation stays well inside the serverless time limit; a backlog drains over successive nights. */
const MAX_ACCOUNTS_PER_RUN = 25;

export interface RetentionReport {
  dryRun: boolean;
  softDeletedAccountsErased: number;
  /** Eligible accounts that failed to erase this run (retried next run). */
  accountErasureFailures: number;
  /** Eligible accounts left for later runs because of the per-run cap. */
  accountsRemaining: number;
  expiredRefreshTokens: number;
  usedOrExpiredResetTokens: number;
  expiredChatMessages: number;
}

/**
 * Scheduled data-retention pass (see docs/DATA_RETENTION.md):
 *  - accounts soft-deleted (e.g. by an admin) longer than SOFT_DELETE_RETENTION_DAYS ago are erased and anonymised;
 *  - refresh tokens and password-reset tokens past their useful life are removed;
 *  - AI chat messages older than CHAT_RETENTION_DAYS are removed.
 * Destructive writes happen only when dryRun is false; a dry run just reports what would be affected.
 */
export async function runRetentionPurge(dryRun: boolean = env.RETENTION_DRY_RUN): Promise<RetentionReport> {
  const now = Date.now();
  const accountCutoff = new Date(now - env.SOFT_DELETE_RETENTION_DAYS * DAY_MS);
  const chatCutoff = new Date(now - env.CHAT_RETENTION_DAYS * DAY_MS);
  const tokenCutoff = new Date(now - TOKEN_GRACE_DAYS * DAY_MS);

  const accountWhere = {
    deleted: true,
    deletedAt: { lt: accountCutoff },
    NOT: { email: { endsWith: `@${ERASED_EMAIL_DOMAIN}` } },
  };
  const refreshWhere = { OR: [{ expiresAt: { lt: tokenCutoff } }, { revokedAt: { lt: tokenCutoff } }] };
  const resetWhere = { OR: [{ expiresAt: { lt: tokenCutoff } }, { usedAt: { lt: tokenCutoff } }] };
  const chatWhere = { createdAt: { lt: chatCutoff } };

  const eligible = await prisma.user.findMany({ where: accountWhere, select: { id: true }, orderBy: { deletedAt: 'asc' } });
  const accounts = eligible.slice(0, MAX_ACCOUNTS_PER_RUN);
  const accountsRemaining = eligible.length - accounts.length;

  if (dryRun) {
    const [expiredRefreshTokens, usedOrExpiredResetTokens, expiredChatMessages] = await Promise.all([
      prisma.refreshToken.count({ where: refreshWhere }),
      prisma.passwordResetToken.count({ where: resetWhere }),
      prisma.chatMessage.count({ where: chatWhere }),
    ]);
    return {
      dryRun,
      softDeletedAccountsErased: accounts.length,
      accountErasureFailures: 0,
      accountsRemaining,
      expiredRefreshTokens,
      usedOrExpiredResetTokens,
      expiredChatMessages,
    };
  }

  let erased = 0;
  let failures = 0;
  for (const { id } of accounts) {
    try {
      await prisma.$transaction((tx) => eraseUserData(tx, id), { maxWait: 10_000, timeout: 30_000 });
      erased++;
    } catch (err) {
      // One bad account must not block the others or the token/chat cleanup below; it is retried next run.
      failures++;
      console.error('Retention: failed to erase an account:', err instanceof Error ? err.message : 'unknown error');
    }
  }

  // SAFE: expired/revoked credentials are useless and are exactly what the retention policy removes.
  const refresh = await prisma.refreshToken.deleteMany({ where: refreshWhere });
  const reset = await prisma.passwordResetToken.deleteMany({ where: resetWhere }); // SAFE: same as above
  const chat = await prisma.chatMessage.deleteMany({ where: chatWhere }); // SAFE: chat retention window elapsed

  return {
    dryRun,
    softDeletedAccountsErased: erased,
    accountErasureFailures: failures,
    accountsRemaining,
    expiredRefreshTokens: refresh.count,
    usedOrExpiredResetTokens: reset.count,
    expiredChatMessages: chat.count,
  };
}
