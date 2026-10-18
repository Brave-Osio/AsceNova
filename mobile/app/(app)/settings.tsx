import { useMemo, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import Card from '../../src/components/ui/Card';
import PageHeader from '../../src/components/ui/PageHeader';
import ChangePasswordForm from '../../src/features/settings/components/ChangePasswordForm';
import RecoveryEmailForm from '../../src/features/settings/components/RecoveryEmailForm';
import DeleteAccountPanel from '../../src/features/settings/components/DeleteAccountPanel';
import TermsModal from '../../src/features/auth/components/TermsModal';
import BmiCard from '../../src/features/profile/components/BmiCard';
import ProfileSetupForm from '../../src/features/profile/components/ProfileSetupForm';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import { fonts, spacing, typography, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const isOnboarding = !isLoading && !profile;
  const [termsOpen, setTermsOpen] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isOnboarding) {
    return (
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <PageHeader eyebrow="Account" title="Set up your profile" subtitle="Tell us a bit about yourself so we can build your plan. You can change any of this later." />
        <SectionCard title="Profile and fitness preferences" styles={styles}>
          <ProfileSetupForm redirectOnSave />
        </SectionCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <PageHeader eyebrow="Account" title="Profile and settings" subtitle="Update your personal details and fitness preferences, and manage your account security." />

      <SectionCard title="Profile and fitness preferences" styles={styles}>
        <ProfileSetupForm />
      </SectionCard>

      <BmiCard />

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

      <SectionCard title="Recovery Gmail" styles={styles}>
        <RecoveryEmailForm />
      </SectionCard>

      <SectionCard title="Change Password" styles={styles}>
        <ChangePasswordForm />
      </SectionCard>

      <SectionCard title="Delete Account" styles={styles}>
        <DeleteAccountPanel />
      </SectionCard>

      <Text style={styles.termsNote}>
        Read how we handle your data in the{' '}
        <Text style={styles.termsLink} onPress={() => setTermsOpen(true)} accessibilityRole="link">
          Terms and Conditions
        </Text>
        .
      </Text>
      <TermsModal visible={termsOpen} onClose={() => setTermsOpen(false)} />
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
    termsNote: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, paddingHorizontal: spacing.xs },
    termsLink: { color: colors.primaryLight, fontFamily: fonts.semibold, textDecorationLine: 'underline' },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    container: { padding: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    card: { marginBottom: spacing.md },
    profileNote: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19, marginBottom: spacing.md },
    cardLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.xs },
    rowLabel: { color: colors.textMuted, fontSize: 14, fontFamily: fonts.regular },
    rowValue: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold, flexShrink: 1, textAlign: 'right' },
  });
}
