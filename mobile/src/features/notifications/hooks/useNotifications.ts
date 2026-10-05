import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../../services/notificationService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast } from '../../../lib/toast';

/** Same as the web's shared QueryClient default (staleTime 60s) — no interval polling there either. */
const STALE_TIME_MS = 60_000;

/** Mirrors the web app's useNotifications.ts. */
export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? '';

  const listQuery = useQuery({
    queryKey: queryKeys.notifications.list(userId),
    queryFn: getNotifications,
    enabled: isAuthenticated,
    staleTime: STALE_TIME_MS,
  });

  const countQuery = useQuery({
    queryKey: queryKeys.notifications.unreadCount(userId),
    queryFn: getUnreadCount,
    enabled: isAuthenticated,
    staleTime: STALE_TIME_MS,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(userId) });
  }

  async function markAsRead(id: string) {
    try {
      await markNotificationAsRead(id);
      invalidate();
    } catch (err) {
      showErrorToast(err);
    }
  }

  async function markAllAsRead() {
    try {
      await markAllNotificationsAsRead();
      invalidate();
    } catch (err) {
      showErrorToast(err);
    }
  }

  return {
    notifications: listQuery.data ?? [],
    unreadCount: countQuery.data ?? 0,
    isLoading: listQuery.isLoading,
    markAsRead,
    markAllAsRead,
  };
}
