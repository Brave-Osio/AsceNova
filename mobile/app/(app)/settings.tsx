import { useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';
import PageHeader from '../../src/components/ui/PageHeader';
import ChangePasswordForm from '../../src/features/settings/components/ChangePasswordForm';
import RecoveryEmailForm from '../../src/features/settings/components/RecoveryEmailForm';
import { fonts, spacing, typography, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <PageHeader title="Settings" subtitle="Manage your account and security." />

      <SectionCard title="Account" styles={styles}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Username</Text>
          <Text style={styles.rowValue}>{user?.email ?? ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Role</Text>
          <Text style={styles.rowValue}>{user?.role ?? 'USER'}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Profile" styles={styles}>
        <Text style={styles.profileNote}>Update your body stats, goal and training preferences.</Text>
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
    </ScrollView>
  );
}

function SectionCard({
  title,
  styles,
  children,
}: {
  title: string;
  styles: ReturnType<typeof createStyles>;
  children: ReactNode;
}) {
  return (
    <Card style={styles.card}>
      <Text style={styles.cardLabel}>{title}</Text>
      {children}
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { padding: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    card: { marginBottom: spacing.md },
    profileNote: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19, marginBottom: spacing.md },
    cardLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.xs },
    rowLabel: { color: colors.textMuted, fontSize: 14, fontFamily: fonts.regular },
    rowValue: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold, flexShrink: 1, textAlign: 'right' },
  });
}
