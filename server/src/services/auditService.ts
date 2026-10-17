import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prismaClient.js';

export const AUDIT_ACTIONS = [
  'ADMIN_LOGIN',
  'ADMIN_LOGOUT',
  'USER_SUSPEND',
  'USER_REACTIVATE',
  'USER_GRANT_ADMIN',
  'USER_REVOKE_ADMIN',
  'USER_DELETE',
  'ACHIEVEMENT_UPDATE',
  'USER_EXPORT',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type AuditOutcome = 'SUCCESS' | 'FAILURE';

export interface AdminContext {
  actorId: string;
  requestId?: string;
}

export interface AuditEntry {
  actorId: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  outcome: AuditOutcome;
  /** Concise human-readable summary. Must not contain emails, tokens, passwords or request bodies. */
  description: string;
  requestId?: string;
}

type Db = Prisma.TransactionClient | typeof prisma;

/** Writes one audit row. Pass a transaction client to commit it atomically with the change it describes. */
export async function record(entry: AuditEntry, db: Db = prisma): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      outcome: entry.outcome,
      description: entry.description.slice(0, 300),
      requestId: entry.requestId,
    },
  });
}

/** Failure auditing must never mask the original error or take the request down. */
async function recordFailureQuietly(entry: AuditEntry): Promise<void> {
  try {
    await record(entry);
  } catch (err) {
    console.error('Failed to record audit failure event:', err instanceof Error ? err.message : 'unknown error');
  }
}

export interface AuditedAction {
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  description: string;
}

/**
 * Runs `fn` and its SUCCESS audit row in one transaction (both commit or neither does).
 * If `fn` throws, a FAILURE row is recorded outside the rolled-back transaction and the error is rethrown.
 */
export async function withAudit<T>(
  ctx: AdminContext,
  meta: AuditedAction,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      const result = await fn(tx);
      await record({ ...meta, actorId: ctx.actorId, requestId: ctx.requestId, outcome: 'SUCCESS' }, tx);
      return result;
    });
  } catch (err) {
    await recordFailureQuietly({
      ...meta,
      actorId: ctx.actorId,
      requestId: ctx.requestId,
      outcome: 'FAILURE',
      description: `Failed: ${meta.description}`,
    });
    throw err;
  }
}

export interface ListAuditLogsInput {
  /** A username (partial, case-insensitive) or an exact administrator id. */
  actor?: string;
  action?: AuditAction;
  outcome?: AuditOutcome;
  from?: Date;
  to?: Date;
  page: number;
  pageSize: number;
}

export async function listAuditLogs({ actor, action, outcome, from, to, page, pageSize }: ListAuditLogsInput) {
  let actorIds: string[] | undefined;
  if (actor) {
    const matches = await prisma.user.findMany({
      where: { OR: [{ id: actor }, { email: { contains: actor, mode: 'insensitive' } }] },
      select: { id: true },
      take: 100,
    });
    actorIds = [...new Set([actor, ...matches.map((u) => u.id)])];
  }

  const where: Prisma.AuditLogWhereInput = {
    ...(actorIds && { actorId: { in: actorIds } }),
    ...(action && { action }),
    ...(outcome && { outcome }),
    ...((from || to) && { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }),
  };

  const [events, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Usernames are resolved at read time so the immutable audit table never stores them. Erased
  // accounts have an anonymised placeholder email, which is reported as null (shown as "deleted account").
  const userIds = [
    ...new Set(
      events.flatMap((e) => [e.actorId, e.targetType === 'USER' ? e.targetId : null]).filter((id): id is string => !!id),
    ),
  ];
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } })
    : [];
  const usernameById = new Map(users.map((u) => [u.id, u.email.endsWith('@deleted.invalid') ? null : u.email]));

  return {
    events: events.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      actorUsername: usernameById.get(e.actorId) ?? null,
      targetUsername: e.targetType === 'USER' && e.targetId ? (usernameById.get(e.targetId) ?? null) : null,
    })),
    total,
    page,
    pageSize,
  };
}
