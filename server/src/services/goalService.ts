import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import { getRankForXp } from './progressService.js';
import type { CreateGoalInput, UpdateGoalInput } from '../validators/goal.validators.js';

/** Flat reward, matching ACHIEVEMENT_UNLOCK's convention in progressService.ts. */
const GOAL_PROGRESS_XP = 100;

export async function createGoal(userId: string, input: CreateGoalInput) {
  return prisma.goal.create({
    data: {
      userId,
      goalType: input.goalType,
      targetValue: input.targetValue,
      targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
      progressNote: input.progressNote,
    },
  });
}

export async function listGoals(userId: string) {
  return prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function updateGoal(userId: string, goalId: string, input: UpdateGoalInput) {
  const result = await prisma.goal.updateMany({
    where: { id: goalId, userId },
    data: {
      ...(input.targetValue !== undefined && { targetValue: input.targetValue }),
      ...(input.targetDate !== undefined && { targetDate: new Date(input.targetDate) }),
      ...(input.progressNote !== undefined && { progressNote: input.progressNote }),
    },
  });
  if (result.count === 0) {
    throw new HttpError(404, 'Goal not found');
  }
}

/**
 * Grants a flat XP reward and keeps cachedRank in sync (recomputed here,
 * not just left stale until the next daily log) — a light touch, not a
 * full gamification integration: no RankHistory row or notification,
 * unlike applyDailyLog's rank-up handling.
 */
export async function completeGoal(userId: string, goalId: string) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.goal.updateMany({
      where: { id: goalId, userId, status: 'ACTIVE' },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    if (result.count === 0) {
      throw new HttpError(404, 'Active goal not found');
    }

    const progress = await tx.userProgress.upsert({
      where: { userId },
      create: { userId, totalXp: GOAL_PROGRESS_XP, cachedRank: getRankForXp(GOAL_PROGRESS_XP) },
      update: { totalXp: { increment: GOAL_PROGRESS_XP } },
    });
    const newRank = getRankForXp(progress.totalXp);
    if (newRank !== progress.cachedRank) {
      await tx.userProgress.update({ where: { userId }, data: { cachedRank: newRank } });
    }
    await tx.xpHistory.create({
      data: { userId, amount: GOAL_PROGRESS_XP, reason: 'GOAL_PROGRESS', sourceRefId: goalId },
    });

    return tx.goal.findUniqueOrThrow({ where: { id: goalId } });
  });
}

export async function abandonGoal(userId: string, goalId: string) {
  const result = await prisma.goal.updateMany({
    where: { id: goalId, userId, status: 'ACTIVE' },
    data: { status: 'ABANDONED', completedAt: new Date() },
  });
  if (result.count === 0) {
    // Idempotent: a duplicate/late request for an already-abandoned goal is a no-op,
    // not an error — only a missing or completed goal is reported.
    const existing = await prisma.goal.findFirst({ where: { id: goalId, userId }, select: { status: true } });
    if (!existing) {
      throw new HttpError(404, 'Goal not found');
    }
    if (existing.status === 'COMPLETED') {
      throw new HttpError(409, "Completed goals can't be abandoned");
    }
  }
}
