import { httpClient } from '../lib/httpClient';
import type { AppNotification } from '../types/notification.types';

/** Thin wrapper over the notifications API, mirroring the web's notificationService.ts. */
export async function getNotifications(): Promise<AppNotification[]> {
  const res = await httpClient.get<{ notifications: AppNotification[] }>('/api/notifications');
  return res.data.notifications;
}

export async function getUnreadCount(): Promise<number> {
  const res = await httpClient.get<{ count: number }>('/api/notifications/unread-count');
  return res.data.count;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await httpClient.patch(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const res = await httpClient.post<{ count: number }>('/api/notifications/read-all');
  return res.data.count;
}
