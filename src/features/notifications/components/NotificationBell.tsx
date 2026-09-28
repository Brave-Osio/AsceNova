import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Award, Flame, Rocket, ClipboardList, Clock, Info, Megaphone, Swords, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../../../types/notification.types';

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  ACHIEVEMENT: Award,
  STREAK: Flame,
  RANK_UP: Rocket,
  PLAN_READY: ClipboardList,
  REMINDER: Clock,
  SYSTEM: Info,
  ADMIN: Megaphone,
  CHALLENGE_INVITE: Swords,
  CHALLENGE_COMPLETED: Trophy,
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
  const Icon = TYPE_ICONS[notification.type] ?? Info;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        notification.isRead ? 'hover:bg-brand-card' : 'bg-brand-primary/10 hover:bg-brand-primary/15'
      }`}
    >
      <Icon size={16} className="mt-0.5 flex-shrink-0 text-brand-primary-light" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-brand-text">{notification.title}</span>
          {!notification.isRead && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />}
        </span>
        <span className="mt-0.5 block text-xs text-brand-text-secondary">{notification.body}</span>
        <span className="mt-1 block text-[10px] uppercase tracking-wide text-brand-text-muted">
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
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-card text-brand-text-secondary hover:bg-brand-card-alt transition-colors"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white">
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
            className="absolute right-0 top-11 z-50 w-80 max-w-[90vw] card rounded-2xl p-2 shadow-lg"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-brand-text-muted">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="text-xs font-medium text-brand-primary-light hover:text-white"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 space-y-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-brand-text-muted">No notifications yet.</p>
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
