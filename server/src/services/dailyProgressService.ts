import { prisma } from '../lib/prismaClient.js';
import type { UpsertDailyProgressInput } from '../validators/dailyProgress.validators.js';

export async function upsertLog(userId: string, input: UpsertDailyProgressInput) {
  return prisma.dailyProgress.upsert({
    where: { userId_date: { userId, date: input.date } },
    create: { userId, ...input },
    update: { ...input },
  });
}

export async function listLogs(userId: string) {
  return prisma.dailyProgress.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });
}

export async function countLogs(userId: string): Promise<number> {
  return prisma.dailyProgress.count({ where: { userId } });
}

export async function hasWorkoutCompletedLog(userId: string): Promise<boolean> {
  const found = await prisma.dailyProgress.findFirst({
    where: { userId, workoutCompleted: true },
    select: { id: true },
  });
  return found !== null;
}

export async function countWorkoutCompletedLogs(userId: string): Promise<number> {
  return prisma.dailyProgress.count({ where: { userId, workoutCompleted: true } });
}

export async function countWaterGoalHits(userId: string): Promise<number> {
  return prisma.dailyProgress.count({ where: { userId, hitWaterGoal: true } });
}

export async function countProteinGoalHits(userId: string): Promise<number> {
  return prisma.dailyProgress.count({ where: { userId, hitProteinGoal: true } });
}

const METRIC_FIELD = {
  WORKOUTS_COMPLETED: 'workoutCompleted',
  WATER_GOAL_HITS: 'hitWaterGoal',
  PROTEIN_GOAL_HITS: 'hitProteinGoal',
} as const;

/** `date` columns are stored at UTC midnight, so a mid-day timestamp must be floored to its day or that day's own log is excluded. */
function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Period-scoped count, for Challenges — achievements above use lifetime totals instead.
 * `until` caps the window (inclusive) so future-dated rows — e.g. the demo
 * "Simulate progress" logs — can't inflate a challenge that hasn't reached them.
 */
export async function countMetricSince(
  userId: string,
  metric: keyof typeof METRIC_FIELD,
  since: Date,
  until?: Date,
): Promise<number> {
  const field = METRIC_FIELD[metric];
  return prisma.dailyProgress.count({
    where: { userId, date: { gte: startOfUtcDay(since), ...(until && { lte: until }) }, [field]: true },
  });
}

/** Total logged days in a window, regardless of habit values — the denominator for an adherence rate. */
export async function countLogsSince(userId: string, since: Date): Promise<number> {
  return prisma.dailyProgress.count({ where: { userId, date: { gte: since } } });
}
