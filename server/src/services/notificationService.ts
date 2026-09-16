import type { Prisma, NotificationType } from '@prisma/client';
import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Transaction-scoped so callers (e.g. progressService.applyDailyLog) can
 * create a notification atomically alongside whatever triggered it —
 * takes a Prisma.TransactionClient, not the top-level `prisma` client.
 */
export async function createNotification(tx: Prisma.TransactionClient, input: CreateNotificationInput) {
  return tx.notification.create({ data: input });
}

export async function getRecent(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(userId: string, notificationId: string) {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  if (result.count === 0) {
    throw new HttpError(404, 'Notification not found');
  }
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return result.count;
}
