import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Target, Flame } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import { useUserProgress } from '../../src/features/gamification/hooks/useUserProgress';
import Button from '../../src/components/ui/Button';
import { spacing, typography, radius, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

function StatCard({
  label,
  value,
  sub,
  icon,
  styles,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        {icon}
        <Text style={styles.statValue}>{value}</Text>
      </View>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { progress, rank, rankProgress, isLoading: isProgressLoading } = useUserProgress();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Target size={40} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No profile yet</Text>
        <Text style={styles.emptyBody}>Set up your profile to start tracking XP, rank, and streaks.</Text>
        <Button onPress={() => router.push('/(app)/profile-setup')}>Set Up Profile</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Dashboard</Text>
      <Text style={styles.title}>Welcome back, {profile.fullName}</Text>
      <Text style={styles.goal}>Goal: {GOAL_LABEL[profile.goal] ?? profile.goal}</Text>

      {!isProgressLoading && (
        <View style={styles.statsGrid}>
          <StatCard styles={styles} label="Rank" value={rank} sub={`${Math.round(rankProgress * 100)}% to next`} />
          <StatCard styles={styles} label="Total XP" value={String(progress.totalXp)} />
          <StatCard
            styles={styles}
            label="Streak"
            value={String(progress.currentStreak)}
            sub={`Best: ${progress.longestStreak}`}
            icon={<Flame size={16} color={colors.accentInk} />}
          />
          <StatCard styles={styles} label="Achievements" value={String(progress.unlockedAchievementIds.length)} />
        </View>
      )}

      <Text style={styles.email}>{user?.email}</Text>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      padding: spacing.lg,
      gap: spacing.md,
    },
    emptyTitle: { ...typography.h2, color: colors.textPrimary },
    emptyBody: { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
    container: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl * 2 },
    eyebrow: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
    title: { ...typography.h1, color: colors.textPrimary },
    goal: { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    statCard: {
      width: '47%',
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    statLabel: { ...typography.label, color: colors.textMuted },
    statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
    statValue: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
    statSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
    email: { color: colors.textMuted, fontSize: 12, marginTop: spacing.lg, textAlign: 'center' },
  });
}
