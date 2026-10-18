import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import { record, recordFailureQuietly, type AdminContext } from './auditService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_WINDOW_DAYS = 30;

export interface CoachContext extends AdminContext {
  role: Role;
}

export interface ListClientsInput {
  search?: string;
  page: number;
  pageSize: number;
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Which accounts this actor may view: a coach sees only their active, assigned clients; an admin
 * sees every other live account. Every client-facing query goes through this one filter.
 */
function viewableClients(ctx: CoachContext): Prisma.UserWhereInput {
  if (ctx.role === 'ADMIN') {
    return { deleted: false, id: { not: ctx.actorId } };
  }
  return { deleted: false, coachAssignment: { is: { coachId: ctx.actorId, active: true } } };
}

/**
 * Clients visible to the actor, with a deliberately small row: username (the login name), rank, XP,
 * streak and last check-in. No profile, body or contact data.
 */
export async function listClients(ctx: CoachContext, { search, page, pageSize }: ListClientsInput) {
  const where: Prisma.UserWhereInput = {
    ...viewableClients(ctx),
    ...(search && { email: { contains: search, mode: 'insensitive' as const } }),
  };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        userProgress: { select: { totalXp: true, cachedRank: true, currentStreak: true, lastLogDate: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  await record({
    actorId: ctx.actorId,
    action: 'COACH_VIEW_CLIENT_LIST',
    outcome: 'SUCCESS',
    description: ctx.role === 'ADMIN' ? 'Viewed the client list as administrator' : 'Viewed their client list',
    requestId: ctx.requestId,
  });

  return {
    clients: rows.map(({ email, userProgress, ...u }) => ({
      ...u,
      username: email,
      totalXp: userProgress?.totalXp ?? 0,
      rank: userProgress?.cachedRank ?? 'IRON',
      currentStreak: userProgress?.currentStreak ?? 0,
      lastLogDate: userProgress?.lastLogDate ? isoDate(userProgress.lastLogDate) : null,
    })),
    total,
    page,
    pageSize,
  };
}

/**
 * Read-only progress snapshot of one client: streak, XP/rank, habit/workout activity for the last
 * 30 days, goals and achievement count. Whitelisted fields only — never weight or body metrics,
 * steps/sleep numbers, free-text notes, goal values, plan or chat content, contact details, or the
 * profile's name/birthday. Usernames are not written to the audit row; they're resolved at read time.
 */
export async function getClientDashboard(ctx: CoachContext, clientId: string) {
  const client = await prisma.user.findFirst({
    where: { AND: [{ id: clientId }, viewableClients(ctx)] },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  if (!client) {
    // 404 (not 403) so a coach can't probe which ids exist; the attempt itself is audited.
    await recordFailureQuietly({
      actorId: ctx.actorId,
      action: 'COACH_VIEW_CLIENT_DASHBOARD',
      targetType: 'USER',
      targetId: clientId,
      outcome: 'FAILURE',
      description: 'Denied: tried to view a dashboard for an account that is not an assigned client',
      requestId: ctx.requestId,
    });
    throw new HttpError(404, 'Client not found');
  }

  const since = new Date(startOfUtcDay(new Date()).getTime() - (ACTIVITY_WINDOW_DAYS - 1) * DAY_MS);
  const [progress, profile, logs, checkIns, workoutsCompleted, goals, achievementsUnlocked] = await Promise.all([
    prisma.userProgress.findUnique({ where: { userId: clientId } }),
    prisma.profile.findUnique({ where: { userId: clientId }, select: { goal: true, fitnessLevel: true } }),
    prisma.dailyProgress.findMany({
      where: { userId: clientId, date: { gte: since } },
      select: {
        date: true,
        workoutCompleted: true,
        hitWaterGoal: true,
        hitProteinGoal: true,
        slept7PlusHours: true,
        reachedStepGoal: true,
      },
      orderBy: { date: 'asc' },
    }),
    prisma.dailyProgress.count({ where: { userId: clientId } }),
    prisma.dailyProgress.count({ where: { userId: clientId, workoutCompleted: true } }),
    prisma.goal.findMany({
      where: { userId: clientId },
      select: { id: true, goalType: true, status: true, targetDate: true, completedAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.achievementProgress.count({ where: { userId: clientId } }),
  ]);

  await record({
    actorId: ctx.actorId,
    action: 'COACH_VIEW_CLIENT_DASHBOARD',
    targetType: 'USER',
    targetId: clientId,
    outcome: 'SUCCESS',
    description: "Viewed a client's dashboard",
    requestId: ctx.requestId,
  });

  return {
    client: { id: client.id, username: client.email, role: client.role, memberSince: client.createdAt.toISOString() },
    focus: profile ? { fitnessGoal: profile.goal, fitnessLevel: profile.fitnessLevel } : null,
    progress: {
      totalXp: progress?.totalXp ?? 0,
      rank: progress?.cachedRank ?? 'IRON',
      currentStreak: progress?.currentStreak ?? 0,
      longestStreak: progress?.longestStreak ?? 0,
      lastLogDate: progress?.lastLogDate ? isoDate(progress.lastLogDate) : null,
    },
    totals: { checkIns, workoutsCompleted, achievementsUnlocked },
    activity: logs.map((l) => ({
      date: isoDate(l.date),
      workoutCompleted: l.workoutCompleted,
      hitWaterGoal: l.hitWaterGoal,
      hitProteinGoal: l.hitProteinGoal,
      slept7PlusHours: l.slept7PlusHours,
      reachedStepGoal: l.reachedStepGoal,
    })),
    goals: goals.map((g) => ({
      id: g.id,
      goalType: g.goalType,
      status: g.status,
      targetDate: g.targetDate ? isoDate(g.targetDate) : null,
      completedAt: g.completedAt ? g.completedAt.toISOString() : null,
    })),
  };
}
