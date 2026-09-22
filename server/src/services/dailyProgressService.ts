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
