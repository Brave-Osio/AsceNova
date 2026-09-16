export type NotificationType =
  | 'ACHIEVEMENT'
  | 'STREAK'
  | 'RANK_UP'
  | 'PLAN_READY'
  | 'REMINDER'
  | 'SYSTEM'
  | 'ADMIN';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string; // ISO timestamp
}
