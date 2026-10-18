import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Target, Flame, Dumbbell, Scale, type LucideIcon } from 'lucide-react-native';
import Button from '../../src/components/ui/Button';
import Card, { CardGroup, CardDivider } from '../../src/components/ui/Card';
import { SectionLabel } from '../../src/components/ui/PageHeader';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import TodayTargetsCard from '../../src/features/dashboard/components/TodayTargetsCard';
import WeightProgressCard from '../../src/features/dashboard/components/WeightProgressCard';
import { NextWorkoutCard, CoachTeaserCard } from '../../src/features/dashboard/components/UpNextCards';
import {
  RankPanel,
  XpPanel,
  AchievementsPanel,
  WorkoutCalendarPanel,
  WeeklySummaryPanel,
  StreakPanel,
} from '../../src/features/dashboard/components/ProgressPanels';
import { fonts, spacing, typography, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

const GOAL_ICON: Record<string, LucideIcon> = {
  WEIGHT_LOSS: Flame,
  MUSCLE_GAIN: Dumbbell,
  MAINTAIN_WEIGHT: Scale,
};

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return <View style={styles.flex} />;

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Card size="hero" style={styles.emptyCard}>
          <Target size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No profile yet</Text>
          <Text style={styles.emptyBody}>Set up your profile to start tracking XP, rank, and streaks.</Text>
          <Button fullWidth={false} onPress={() => router.push('/(app)/settings')}>
            Set Up Profile
          </Button>
        </Card>
      </View>
    );
  }

  const GoalIcon = GOAL_ICON[profile.goal] ?? Target;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Dashboard</Text>
        <Text style={styles.title}>Welcome back, {profile.fullName}</Text>
        <View style={styles.goalRow}>
          <GoalIcon size={15} color={colors.textSecondary} />
          <Text style={styles.goalText}>
            Goal: <Text style={styles.goalValue}>{GOAL_LABEL[profile.goal] ?? profile.goal}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.hero}>
        <TodayTargetsCard />
      </View>

      <SectionLabel>User Progress</SectionLabel>
      <CardGroup>
        <RankPanel />
        <CardDivider />
        <XpPanel />
        <CardDivider />
        <AchievementsPanel />
      </CardGroup>

      <SectionLabel>Fitness Activity</SectionLabel>
      <CardGroup>
        <WorkoutCalendarPanel />
        <CardDivider />
        <WeeklySummaryPanel />
        <CardDivider />
        <StreakPanel />
      </CardGroup>

      <View style={styles.section}>
        <WeightProgressCard />
      </View>

      <SectionLabel>Up Next</SectionLabel>
      <View style={styles.upNext}>
        <NextWorkoutCard />
        <CoachTeaserCard />
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingTop: spacing.md, paddingBottom: spacing.xl * 2 },
    emptyContainer: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', paddingHorizontal: spacing.md + 4 },
    emptyCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
    emptyTitle: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.sm },
    emptyBody: { ...typography.subtitle, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
    header: { alignItems: 'flex-start' },
    eyebrow: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      color: colors.textMuted,
      opacity: 0.85,
      textTransform: 'uppercase',
      letterSpacing: 1.4,
      marginBottom: 6,
    },
    title: { ...typography.h1, color: colors.textPrimary },
    goalRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    goalText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
    goalValue: { fontFamily: fonts.medium, color: colors.textPrimary },
    hero: { marginTop: spacing.lg },
    section: { marginTop: spacing.lg },
    upNext: { gap: spacing.md },
  });
}
