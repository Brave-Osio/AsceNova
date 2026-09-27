import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../../../types/notification.types';

const TYPE_ICONS: Record<NotificationType, string> = {
  ACHIEVEMENT: '🏅',
  STREAK: '🔥',
  RANK_UP: '🚀',
  PLAN_READY: '📋',
  REMINDER: '⏰',
  SYSTEM: 'ℹ️',
  ADMIN: '📢',
  CHALLENGE_INVITE: '⚔️',
  CHALLENGE_COMPLETED: '🏆',
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function NotificationRow({ notification, onClick }: { notification: AppNotification; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        notification.isRead ? 'hover:bg-white/5' : 'bg-violet-500/10 hover:bg-violet-500/15'
      }`}
    >
      <span className="text-base leading-none">{TYPE_ICONS[notification.type] ?? 'ℹ️'}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-100">{notification.title}</span>
          {!notification.isRead && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />}
        </span>
        <span className="mt-0.5 block text-xs text-gray-400">{notification.body}</span>
        <span className="mt-1 block text-[10px] uppercase tracking-wide text-gray-600">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>
    </button>
  );
}

/**
 * Self-contained: checks its own auth state and renders nothing when
 * logged out, so it can drop straight into Navbar without Navbar itself
 * needing to become auth-aware.
 */
export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-80 max-w-[90vw] rounded-2xl border border-white/10 bg-[var(--color-brand-surface)] p-2 shadow-2xl"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="text-xs font-medium text-violet-300 hover:text-violet-200"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 space-y-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-gray-500">No notifications yet.</p>
              ) : (
                notifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
