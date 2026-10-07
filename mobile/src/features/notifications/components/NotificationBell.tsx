import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Award,
  Flame,
  Rocket,
  ClipboardList,
  Clock,
  Info,
  Megaphone,
  Swords,
  Trophy,
  type LucideIcon,
} from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../../../types/notification.types';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';

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

function NotificationRow({
  notification,
  onPress,
  styles,
  iconColor,
}: {
  notification: AppNotification;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  iconColor: string;
}) {
  const Icon = TYPE_ICONS[notification.type] ?? Info;
  return (
    <Pressable onPress={onPress} style={[styles.row, !notification.isRead && styles.rowUnread]}>
      <View style={styles.rowIcon}>
        <Icon size={16} color={iconColor} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTitleLine}>
          <Text style={styles.rowTitle}>{notification.title}</Text>
          {!notification.isRead && <View style={styles.dot} />}
        </View>
        <Text style={styles.rowText}>{notification.body}</Text>
        <Text style={styles.rowTime}>{formatRelativeTime(notification.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

/**
 * Drawer-footer entry for the web's NotificationBell: a bell row with an unread badge that
 * opens a bottom-sheet panel. Renders nothing when logged out.
 */
export default function NotificationBell() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={styles.bellRow}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <View>
          <Bell size={18} color={colors.textSecondary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.bellLabel}>Notifications</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsOpen(false)} accessibilityLabel="Close notifications" />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.sm }]}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <Pressable onPress={() => void markAllAsRead()} hitSlop={8}>
                  <Text style={styles.markAll}>Mark all read</Text>
                </Pressable>
              )}
            </View>
            <ScrollView contentContainerStyle={styles.list}>
              {notifications.length === 0 ? (
                <Text style={styles.empty}>No notifications yet.</Text>
              ) : (
                notifications.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onPress={() => {
                      if (!n.isRead) void markAsRead(n.id);
                    }}
                    styles={styles}
                    iconColor={colors.primaryLight}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    bellRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 4,
      paddingVertical: 10,
      paddingHorizontal: spacing.sm + 4,
      borderRadius: radius.md,
    },
    bellLabel: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium },
    badge: {
      position: 'absolute',
      top: -6,
      right: -8,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: { color: '#fff', fontSize: 10, fontFamily: fonts.bold },
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
      maxHeight: '75%',
      backgroundColor: colors.surfaceAlt,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
    headerTitle: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: fonts.bold,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    markAll: { color: colors.primaryLight, fontSize: 12, fontFamily: fonts.medium },
    list: { gap: 4 },
    empty: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: fonts.regular,
      textAlign: 'center',
      paddingVertical: spacing.lg,
    },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm + 4, borderRadius: radius.md, padding: spacing.sm + 4 },
    rowUnread: { backgroundColor: colors.primaryMuted },
    rowIcon: { marginTop: 2 },
    rowBody: { flex: 1 },
    rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    rowTitle: { flexShrink: 1, color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
    rowText: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.regular, marginTop: 2 },
    rowTime: {
      color: colors.textMuted,
      fontSize: 10,
      fontFamily: fonts.regular,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 4,
    },
  });
}
