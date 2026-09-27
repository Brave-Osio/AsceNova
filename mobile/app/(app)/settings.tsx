import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import Button from '../../src/components/ui/Button';
import ChangePasswordForm from '../../src/features/settings/components/ChangePasswordForm';
import { colors, spacing, typography, radius } from '../../src/theme';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

      <SectionCard title="Account">
        <Row label="Email" value={user?.email ?? ''} />
        <Row label="Role" value={user?.role ?? 'USER'} />
      </SectionCard>

      <SectionCard title="Profile">
        <Button variant="secondary" onPress={() => router.push('/(app)/profile-setup')}>
          Edit Profile
        </Button>
      </SectionCard>

      <SectionCard title="Change Password">
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

const styles = StyleSheet.create({
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
  logoutSection: { marginTop: spacing.md, alignItems: 'center' },
});
