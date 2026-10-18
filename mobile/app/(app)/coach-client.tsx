import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import ClientDashboardView from '../../src/features/coaching/components/ClientDashboardView';
import { useClientDashboard } from '../../src/features/coaching/hooks/useClientDashboard';
import PageHeader from '../../src/components/ui/PageHeader';
import { fonts, spacing, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';

/** Read-only dashboard of one client, opened from the coach tab (`/coach-client?clientId=…`). */
export default function CoachClientScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { canCoach } = useAuth();
  const { clientId } = useLocalSearchParams<{ clientId?: string }>();
  const { dashboard, isLoading, isError } = useClientDashboard(clientId ?? '');

  if (!canCoach) return <Redirect href="/" />;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Pressable
        onPress={() => router.navigate('/coach' as never)}
        accessibilityRole="button"
        accessibilityLabel="Back to clients"
        style={styles.back}
        hitSlop={8}
      >
        <ArrowLeft size={14} color={colors.textMuted} />
        <Text style={styles.backText}>Back to clients</Text>
      </Pressable>

      {isLoading ? (
        <ActivityIndicator style={styles.state} color={colors.primary} />
      ) : isError || !dashboard ? (
        <Text style={[styles.state, styles.error]} accessibilityRole="alert">
          This client couldn&apos;t be found, or isn&apos;t assigned to you.
        </Text>
      ) : (
        <>
          <PageHeader
            eyebrow="Client dashboard"
            title={dashboard.client.username}
            subtitle={`Member since ${new Date(dashboard.client.memberSince).toLocaleDateString()} · read-only view, recorded in the audit log`}
          />
          <ClientDashboardView dashboard={dashboard} />
        </>
      )}
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingTop: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
    backText: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium },
    state: { marginTop: spacing.xl, textAlign: 'center' },
    error: { color: colors.danger, fontFamily: fonts.medium, fontSize: 14 },
  });
}
