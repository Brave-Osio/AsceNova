import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Menu,
  X,
  ClipboardList,
  LayoutDashboard,
  NotebookPen,
  Trophy,
  Swords,
  Target,
  Users,
  Bot,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  type LucideIcon,
} from 'lucide-react-native';
import { fonts, radius, spacing, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../ui/BrandLogo';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import CoachPanel from '../../features/coach-chat/components/CoachPanel';
import { CoachPanelProvider, useCoachPanel } from '../../features/coach-chat/CoachPanelContext';

interface NavItem {
  label: string;
  /** Path as seen by usePathname() (route groups are not part of it). */
  path: string;
  icon: LucideIcon;
  /** Visible to coaches and admins only. */
  coachOnly?: boolean;
}

/** Same order as the web's NAV_LINKS (minus Home/Admin, which the app doesn't have). */
const NAV_ITEMS: NavItem[] = [
  { label: 'Plan', path: '/plan', icon: ClipboardList },
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Daily Log', path: '/log', icon: NotebookPen },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { label: 'Challenges', path: '/challenges', icon: Swords },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Coach', path: '/coach', icon: Users, coachOnly: true },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

const DRAWER_WIDTH = 256;
const TOP_BAR_HEIGHT = 56;

/** The web's phone-width chrome: sticky top bar (hamburger + logo + coach launcher) and an off-canvas drawer. */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <CoachPanelProvider>
      <AppShellInner>{children}</AppShellInner>
    </CoachPanelProvider>
  );
}

function AppShellInner({ children }: { children: ReactNode }) {
  const { open: openCoach } = useCoachPanel();
  const { colors, theme, toggleTheme } = useAppTheme();
  const { logout, canCoach } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  const drawerWidth = Math.min(DRAWER_WIDTH, width * 0.85);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));

  const animateTo = useCallback(
    (toValue: 0 | 1, onDone?: () => void) => {
      Animated.timing(progress, {
        toValue,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(onDone);
    },
    [progress],
  );

  const openDrawer = useCallback(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    animateTo(0, () => setMounted(false));
  }, [animateTo]);

  useEffect(() => {
    if (open && mounted) animateTo(1);
  }, [open, mounted, animateTo]);

  const go = (path: string) => {
    closeDrawer();
    // Typed routes aren't generated for this project, so the path is a plain string.
    router.navigate(path as never);
  };

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-drawerWidth, 0] });

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top, height: TOP_BAR_HEIGHT + insets.top }]}>
        <Pressable onPress={openDrawer} accessibilityRole="button" accessibilityLabel="Open menu" style={styles.menuButton}>
          <Menu size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.logoRow}>
          <BrandLogo size={30} />
          <Text style={styles.logoText}>AsceNova</Text>
        </View>
        <Pressable onPress={openCoach} accessibilityRole="button" accessibilityLabel="Open AI coach chat" style={styles.coachButton}>
          <Bot size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Android draws edge-to-edge, so the OS no longer resizes the window for the keyboard — pad here, once, for every screen. */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior="padding"
        keyboardVerticalOffset={TOP_BAR_HEIGHT + insets.top}
      >
        {children}
      </KeyboardAvoidingView>

      <CoachPanel />

      {mounted && (
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
          <Animated.View style={[styles.backdrop, { opacity: progress }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} accessibilityLabel="Close menu" />
          </Animated.View>
          <Animated.View
            style={[
              styles.drawer,
              { width: drawerWidth, paddingTop: insets.top, paddingBottom: insets.bottom, transform: [{ translateX }] },
            ]}
          >
            <View style={styles.drawerHeader}>
              <View style={styles.logoRow}>
                <BrandLogo size={30} />
                <Text style={styles.logoText}>AsceNova</Text>
              </View>
              <Pressable onPress={closeDrawer} accessibilityLabel="Close menu" style={styles.closeButton}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.navList}>
              {NAV_ITEMS.filter((item) => !item.coachOnly || canCoach).map(({ label, path, icon: Icon }) => {
                const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
                return (
                  <Pressable
                    key={path}
                    onPress={() => go(path)}
                    style={[styles.navItem, active && styles.navItemActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Icon size={18} color={active ? colors.primaryLight : colors.textSecondary} />
                    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.drawerFooter}>
              <NotificationBell />
              <Pressable onPress={toggleTheme} style={styles.navItem} accessibilityRole="button">
                {theme === 'dark' ? (
                  <Sun size={18} color={colors.textSecondary} />
                ) : (
                  <Moon size={18} color={colors.textSecondary} />
                )}
                <Text style={styles.navLabel}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  closeDrawer();
                  void logout();
                }}
                style={styles.navItem}
                accessibilityRole="button"
              >
                <LogOut size={18} color={colors.danger} />
                <Text style={[styles.navLabel, { color: colors.danger }]}>Log Out</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    content: { flex: 1 },
    overlay: { pointerEvents: 'box-none' },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardAlt,
    },
    coachButton: {
      marginLeft: 'auto',
      width: 40,
      height: 40,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    logoText: { color: colors.textPrimary, fontSize: 17, fontFamily: fonts.extrabold },
    backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
    drawer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    drawerHeader: {
      height: TOP_BAR_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    navList: { flex: 1, padding: spacing.sm + 4, gap: 2 },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 4,
      paddingVertical: 10,
      paddingHorizontal: spacing.sm + 4,
      borderRadius: radius.md,
    },
    navItemActive: { backgroundColor: colors.primaryMuted },
    navLabel: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium },
    navLabelActive: { color: colors.primaryLight },
    drawerFooter: {
      padding: spacing.sm + 4,
      gap: 2,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
}
