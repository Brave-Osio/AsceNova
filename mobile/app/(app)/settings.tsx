import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Sun, Moon } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import Button from '../../src/components/ui/Button';
import ChangePasswordForm from '../../src/features/settings/components/ChangePasswordForm';
import RecoveryEmailForm from '../../src/features/settings/components/RecoveryEmailForm';
import { spacing, typography, radius, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

function Row({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function SectionCard({ title, styles, children }: { title: string; styles: ReturnType<typeof createStyles>; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isDark = theme === 'dark';

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <SectionCard title="Account" styles={styles}>
        <Row label="Username" value={user?.email ?? ''} styles={styles} />
        <Row label="Role" value={user?.role ?? 'USER'} styles={styles} />
      </SectionCard>

      <SectionCard title="Appearance" styles={styles}>
        <Pressable style={styles.themeRow} onPress={toggleTheme}>
          <View style={styles.themeRowLabel}>
            {isDark ? <Moon size={16} color={colors.textSecondary} /> : <Sun size={16} color={colors.textSecondary} />}
            <Text style={styles.themeRowText}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
          </View>
          <View style={[styles.switchTrack, !isDark && styles.switchTrackOn]}>
            <View style={[styles.switchThumb, !isDark && styles.switchThumbOn]} />
          </View>
        </Pressable>
      </SectionCard>

      <SectionCard title="Profile" styles={styles}>
        <Button variant="secondary" onPress={() => router.push('/(app)/profile-setup')}>
          Edit Profile
        </Button>
      </SectionCard>

      <SectionCard title="Recovery Gmail" styles={styles}>
        <RecoveryEmailForm />
      </SectionCard>

      <SectionCard title="Change Password" styles={styles}>
        <ChangePasswordForm />
      </SectionCard>

      <View style={styles.logoutSection}>
        <Button variant="ghost" onPress={handleLogout} loading={isLoggingOut}>
          Log Out
        </Button>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl * 2 },
    title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
    card: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    cardLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
    rowLabel: { color: colors.textMuted },
    rowValue: { color: colors.textPrimary, fontWeight: '600' },
    themeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    themeRowLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    themeRowText: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
    switchTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.border, padding: 2, justifyContent: 'center' },
    switchTrackOn: { backgroundColor: colors.primary },
    switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
    switchThumbOn: { transform: [{ translateX: 20 }] },
    logoutSection: { marginTop: spacing.md, alignItems: 'center' },
  });
}
