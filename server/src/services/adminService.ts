import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import { withAudit, record, type AdminContext } from './auditService.js';
import type { AccountStatus, Prisma } from '@prisma/client';

const DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * DAY_MS;
const THIRTY_DAYS_MS = 30 * DAY_MS;

/** Neutralises spreadsheet formula injection and quotes fields containing separators. */
function csvEscape(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Aggregate, non-identifying metrics only — everything is computed in the database.
 * "Active user" = a user with a DailyProgress check-in in the window. Because
 * DailyProgress is unique per (user, date), a day's row count is that day's distinct active users.
 */
export async function getStats() {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - SEVEN_DAYS_MS);
  const thirtyDaysAgo = new Date(now - THIRTY_DAYS_MS);
  // "Last N days" = N calendar days inclusive of today (the @db.Date column has no time part).
  const activeSince7d = new Date(startOfUtcDay(new Date(now)).getTime() - 6 * DAY_MS);
  const activeSince30d = new Date(startOfUtcDay(new Date(now)).getTime() - 29 * DAY_MS);

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    deletedUsers,
    newUsers7d,
    newUsers30d,
    progressAggregate,
    totalDailyProgress,
    completedWorkoutDailyProgress,
    goalDistribution,
    adminUsers,
    recentSignups,
    activeUsers7d,
    activeUsers30d,
    workoutPlansGenerated,
    challengeParticipants,
    challengeCompletions,
    dailyActivity,
    workoutsByDate,
  ] = await Promise.all([
    prisma.user.count({ where: { deleted: false } }),
    prisma.user.count({ where: { deleted: false, status: 'ACTIVE' } }),
    prisma.user.count({ where: { deleted: false, status: 'SUSPENDED' } }),
    prisma.user.count({ where: { deleted: true } }),
    prisma.user.count({ where: { deleted: false, createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { deleted: false, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.userProgress.aggregate({ _avg: { totalXp: true, currentStreak: true } }),
    prisma.dailyProgress.count(),
    prisma.dailyProgress.count({ where: { workoutCompleted: true } }),
    prisma.profile.groupBy({ by: ['goal'], _count: { goal: true } }),
    prisma.user.count({ where: { deleted: false, role: 'ADMIN' } }),
    prisma.user.findMany({ where: { deleted: false, createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.dailyProgress
      .groupBy({ by: ['userId'], where: { date: { gte: activeSince7d }, user: { deleted: false } } })
      .then((rows) => rows.length),
    prisma.dailyProgress
      .groupBy({ by: ['userId'], where: { date: { gte: activeSince30d }, user: { deleted: false } } })
      .then((rows) => rows.length),
    prisma.workoutPlan.count(),
    prisma.challengeParticipant.count({ where: { status: 'ACCEPTED' } }),
    prisma.challengeParticipant.count({ where: { completedAt: { not: null } } }),
    prisma.dailyProgress.groupBy({
      by: ['date'],
      where: { date: { gte: activeSince30d }, user: { deleted: false } },
      _count: { _all: true },
    }),
    prisma.dailyProgress.groupBy({
      by: ['date'],
      where: { date: { gte: activeSince30d }, workoutCompleted: true, user: { deleted: false } },
      _count: { _all: true },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    deletedUsers,
    newUsers7d,
    newUsers30d,
    avgTotalXp: Math.round(progressAggregate._avg.totalXp ?? 0),
    avgStreak: Math.round(progressAggregate._avg.currentStreak ?? 0),
    workoutCompletionRate: totalDailyProgress > 0 ? completedWorkoutDailyProgress / totalDailyProgress : 0,
    goalDistribution: goalDistribution.map((row) => ({ goal: row.goal, count: row._count.goal })),
    adminUsers,
    signupsByDay: bucketSignupsByDay(recentSignups.map((u) => u.createdAt), totalUsers),
    activeUsers7d,
    activeUsers30d,
    workoutPlansGenerated,
    totalWorkoutsCompleted: completedWorkoutDailyProgress,
    challengeParticipants,
    challengeCompletions,
    engagementByDay: bucketEngagementByDay(
      dailyActivity.map((r) => ({ date: r.date, count: r._count._all })),
      workoutsByDate.map((r) => ({ date: r.date, count: r._count._all })),
    ),
  };
}

export interface ListUsersInput {
  search?: string;
  status?: AccountStatus;
  page: number;
  pageSize: number;
}

/** Deliberately minimal: id, username (the login name), role/status, join date and aggregate counts. No recovery email, name or profile data. */
export async function listUsers({ search, status, page, pageSize }: ListUsersInput) {
  const where: Prisma.UserWhereInput = {
    deleted: false,
    ...(status && { status }),
    ...(search && { OR: [{ id: { contains: search } }, { email: { contains: search, mode: 'insensitive' as const } }] }),
  };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        userProgress: { select: { totalXp: true, cachedRank: true } },
        _count: { select: { dailyProgress: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const completed = rows.length
    ? await prisma.dailyProgress.groupBy({
        by: ['userId'],
        where: { userId: { in: rows.map((r) => r.id) }, workoutCompleted: true },
        _count: { _all: true },
      })
    : [];
  const completedByUser = new Map(completed.map((c) => [c.userId, c._count._all]));

  const users = rows.map(({ _count, ...u }) => ({
    ...u,
    checkIns: _count.dailyProgress,
    workoutsCompleted: completedByUser.get(u.id) ?? 0,
  }));

  return { users, total, page, pageSize };
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deleted: false },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      userProgress: {
        select: { totalXp: true, cachedRank: true, currentStreak: true, longestStreak: true, lastLogDate: true },
      },
      _count: { select: { dailyProgress: true, workoutPlans: true } },
    },
  });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  const workoutsCompleted = await prisma.dailyProgress.count({ where: { userId, workoutCompleted: true } });

  const { _count, ...rest } = user;
  return { user: rest, checkIns: _count.dailyProgress, workoutPlans: _count.workoutPlans, workoutsCompleted };
}

function assertNotSelf(actingAdminId: string, targetUserId: string) {
  if (actingAdminId === targetUserId) {
    throw new HttpError(400, "You can't perform this action on your own account");
  }
}

const SAFE_USER_SELECT = { id: true, email: true, role: true, status: true, createdAt: true } as const;

/** Same lock as self-delete of an admin (authService.deleteAccount): admin removals are serialised. */
async function lockAdminRemoval(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('admin-removal'))`;
}

async function findActiveUserOrThrow(tx: Prisma.TransactionClient, userId: string) {
  const user = await tx.user.findFirst({ where: { id: userId, deleted: false }, select: SAFE_USER_SELECT });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  return user;
}

export async function suspendUser(ctx: AdminContext, userId: string) {
  return withAudit(
    ctx,
    { action: 'USER_SUSPEND', targetType: 'USER', targetId: userId, description: 'Suspended a user account' },
    async (tx) => {
      assertNotSelf(ctx.actorId, userId);
      await lockAdminRemoval(tx);
      await findActiveUserOrThrow(tx, userId);
      return tx.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' }, select: SAFE_USER_SELECT });
    },
  );
}

export async function reactivateUser(ctx: AdminContext, userId: string) {
  return withAudit(
    ctx,
    { action: 'USER_REACTIVATE', targetType: 'USER', targetId: userId, description: 'Reactivated a user account' },
    async (tx) => {
      assertNotSelf(ctx.actorId, userId);
      await findActiveUserOrThrow(tx, userId);
      return tx.user.update({ where: { id: userId }, data: { status: 'ACTIVE' }, select: SAFE_USER_SELECT });
    },
  );
}

export async function softDeleteUser(ctx: AdminContext, userId: string) {
  return withAudit(
    ctx,
    { action: 'USER_DELETE', targetType: 'USER', targetId: userId, description: 'Soft-deleted a user account' },
    async (tx) => {
      assertNotSelf(ctx.actorId, userId);
      await lockAdminRemoval(tx);
      await findActiveUserOrThrow(tx, userId);
      // SAFE: update, not prisma.user.delete() — this codebase soft-deletes only; permanent erasure happens in purgeService after the retention period.
      const user = await tx.user.update({
        where: { id: userId },
        data: { deleted: true, deletedAt: new Date(), status: 'DELETED' },
        select: SAFE_USER_SELECT,
      });
      await tx.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
      return user;
    },
  );
}

/**
 * Grant/revoke admin privileges. Only reachable through the ADMIN-gated
 * admin router, re-checked against the DB role on every request (see
 * requireAuth). Admins can't change their own role (prevents accidental
 * self-lockout), and only active accounts can be promoted.
 */
export async function setUserRole(ctx: AdminContext, userId: string, role: 'ADMIN' | 'USER') {
  return withAudit(
    ctx,
    {
      action: role === 'ADMIN' ? 'USER_GRANT_ADMIN' : 'USER_REVOKE_ADMIN',
      targetType: 'USER',
      targetId: userId,
      description: role === 'ADMIN' ? 'Granted administrator role' : 'Revoked administrator role',
    },
    async (tx) => {
      assertNotSelf(ctx.actorId, userId);
      await lockAdminRemoval(tx);
      const target = await findActiveUserOrThrow(tx, userId);
      if (target.role === role) {
        throw new HttpError(409, role === 'ADMIN' ? 'User is already an administrator' : 'User is not an administrator');
      }
      if (role === 'ADMIN' && target.status !== 'ACTIVE') {
        throw new HttpError(400, 'Only active accounts can be made administrators');
      }
      return tx.user.update({ where: { id: userId }, data: { role }, select: SAFE_USER_SELECT });
    },
  );
}

export async function listAchievements() {
  return prisma.achievement.findMany({ orderBy: { createdAt: 'asc' } });
}

export interface UpdateAchievementInput {
  title?: string;
  description?: string;
  icon?: string;
  xpReward?: number;
  isActive?: boolean;
}

export async function updateAchievement(ctx: AdminContext, id: string, input: UpdateAchievementInput) {
  return withAudit(
    ctx,
    {
      action: 'ACHIEVEMENT_UPDATE',
      targetType: 'ACHIEVEMENT',
      targetId: id,
      // Field names only — never the submitted values.
      description: `Updated achievement fields: ${Object.keys(input).join(', ') || 'none'}`,
    },
    async (tx) => {
      const achievement = await tx.achievement.findUnique({ where: { id } });
      if (!achievement) {
        throw new HttpError(404, 'Achievement not found');
      }
      return tx.achievement.update({ where: { id }, data: input });
    },
  );
}

/** Privacy-minimal export: id, username and aggregates. */
export async function exportUsersCsv(ctx: AdminContext): Promise<string> {
  const users = await prisma.user.findMany({
    where: { deleted: false },
    select: {
      id: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
      userProgress: { select: { totalXp: true, cachedRank: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const header = ['User ID', 'Username', 'Status', 'Role', 'Joined', 'Total XP', 'Rank'];
  const rows = users.map((u) =>
    [
      u.id,
      csvEscape(u.email),
      u.status,
      u.role,
      u.createdAt.toISOString(),
      String(u.userProgress?.totalXp ?? 0),
      u.userProgress?.cachedRank ?? '',
    ].join(','),
  );

  await record({
    actorId: ctx.actorId,
    action: 'USER_EXPORT',
    targetType: 'USER',
    outcome: 'SUCCESS',
    description: `Exported ${users.length} user rows (id, username, aggregates)`,
    requestId: ctx.requestId,
  });

  return [header.join(','), ...rows].join('\n');
}

/** Last 30 UTC days (inclusive of today), oldest first: distinct active users and completed workouts per day. */
function bucketEngagementByDay(active: { date: Date; count: number }[], workouts: { date: Date; count: number }[]) {
  const activeMap = new Map(active.map((r) => [r.date.toISOString().slice(0, 10), r.count]));
  const workoutMap = new Map(workouts.map((r) => [r.date.toISOString().slice(0, 10), r.count]));
  const todayUtc = startOfUtcDay(new Date());
  const days: { date: string; activeUsers: number; workoutsCompleted: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const key = new Date(todayUtc.getTime() - i * DAY_MS).toISOString().slice(0, 10);
    days.push({ date: key, activeUsers: activeMap.get(key) ?? 0, workoutsCompleted: workoutMap.get(key) ?? 0 });
  }
  return days;
}

/**
 * Last 30 days (oldest first, inclusive of today, UTC days) of signups plus a
 * running total, so the UI can draw both a daily bar chart and a growth line.
 * `total` is back-computed from today's user count, so it only ever reflects
 * users who still exist.
 */
function bucketSignupsByDay(createdAts: Date[], totalUsersNow: number) {
  const DAYS = 30;
  const counts = new Map<string, number>();
  for (const d of createdAts) {
    const key = d.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days: { date: string; count: number }[] = [];
  const todayUtc = new Date(new Date().toISOString().slice(0, 10));
  for (let i = DAYS - 1; i >= 0; i--) {
    const day = new Date(todayUtc.getTime() - i * DAY_MS).toISOString().slice(0, 10);
    days.push({ date: day, count: counts.get(day) ?? 0 });
  }

  const signedUpInWindow = days.reduce((sum, d) => sum + d.count, 0);
  let running = totalUsersNow - signedUpInWindow;
  return days.map((d) => {
    running += d.count;
    return { ...d, total: running };
  });
}
