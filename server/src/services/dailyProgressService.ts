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
