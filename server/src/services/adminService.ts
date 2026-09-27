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
