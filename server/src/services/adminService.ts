import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import type { AccountStatus } from '@prisma/client';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getStats() {
  const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

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
  };
}

export interface ListUsersInput {
  search?: string;
  status?: AccountStatus;
  page: number;
  pageSize: number;
}

export async function listUsers({ search, status, page, pageSize }: ListUsersInput) {
  const where = {
    deleted: false,
    ...(status && { status }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { profile: { fullName: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      omit: { passwordHash: true },
      include: {
        profile: { select: { fullName: true } },
        userProgress: { select: { totalXp: true, cachedRank: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, pageSize };
}

export async function getUserDetail(userId: string) {
  const [user, dailyProgressCount, chatMessageCount] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, deleted: false },
      omit: { passwordHash: true },
      include: {
        profile: true,
        userProgress: true,
        workoutPlans: { where: { isActive: true }, include: { workoutDays: true } },
      },
    }),
    prisma.dailyProgress.count({ where: { userId } }),
    prisma.chatMessage.count({ where: { userId } }),
  ]);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return { user, dailyProgressCount, chatMessageCount };
}

function assertNotSelf(actingAdminId: string, targetUserId: string) {
  if (actingAdminId === targetUserId) {
    throw new HttpError(400, "You can't perform this action on your own account");
  }
}

async function findActiveUserOrThrow(userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, deleted: false }, omit: { passwordHash: true } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  return user;
}

export async function suspendUser(actingAdminId: string, userId: string) {
  assertNotSelf(actingAdminId, userId);
  await findActiveUserOrThrow(userId);
  return prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' }, omit: { passwordHash: true } });
}

export async function reactivateUser(actingAdminId: string, userId: string) {
  assertNotSelf(actingAdminId, userId);
  await findActiveUserOrThrow(userId);
  return prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' }, omit: { passwordHash: true } });
}

export async function softDeleteUser(actingAdminId: string, userId: string) {
  assertNotSelf(actingAdminId, userId);
  await findActiveUserOrThrow(userId);
  // SAFE: update, not prisma.user.delete() — this codebase soft-deletes only.
  return prisma.user.update({
    where: { id: userId },
    data: { deleted: true, deletedAt: new Date(), status: 'DELETED' },
    omit: { passwordHash: true },
  });
}

/**
 * Grant/revoke admin privileges. Only reachable through the ADMIN-gated
 * admin router, re-checked against the DB role on every request (see
 * requireAuth). Admins can't change their own role (prevents accidental
 * self-lockout), and only active accounts can be promoted.
 */
export async function setUserRole(actingAdminId: string, userId: string, role: 'ADMIN' | 'USER') {
  assertNotSelf(actingAdminId, userId);
  const target = await findActiveUserOrThrow(userId);
  if (target.role === role) {
    throw new HttpError(409, role === 'ADMIN' ? 'User is already an administrator' : 'User is not an administrator');
  }
  if (role === 'ADMIN' && target.status !== 'ACTIVE') {
    throw new HttpError(400, 'Only active accounts can be made administrators');
  }
  return prisma.user.update({ where: { id: userId }, data: { role }, omit: { passwordHash: true } });
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

export async function updateAchievement(id: string, input: UpdateAchievementInput) {
  const achievement = await prisma.achievement.findUnique({ where: { id } });
  if (!achievement) {
    throw new HttpError(404, 'Achievement not found');
  }
  return prisma.achievement.update({ where: { id }, data: input });
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportUsersCsv(): Promise<string> {
  const users = await prisma.user.findMany({
    where: { deleted: false },
    omit: { passwordHash: true },
    include: {
      profile: { select: { fullName: true } },
      userProgress: { select: { totalXp: true, cachedRank: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const header = ['Email', 'Full Name', 'Status', 'Role', 'Joined', 'Total XP', 'Rank'];
  const rows = users.map((u) =>
    [
      u.email,
      u.profile?.fullName ?? '',
      u.status,
      u.role,
      u.createdAt.toISOString(),
      String(u.userProgress?.totalXp ?? 0),
      u.userProgress?.cachedRank ?? '',
    ]
      .map(csvEscape)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
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
    const day = new Date(todayUtc.getTime() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    days.push({ date: day, count: counts.get(day) ?? 0 });
  }

  const signedUpInWindow = days.reduce((sum, d) => sum + d.count, 0);
  let running = totalUsersNow - signedUpInWindow;
  return days.map((d) => {
    running += d.count;
    return { ...d, total: running };
  });
}
