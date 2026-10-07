import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { User, Sparkles } from 'lucide-react-native';
import Button from '../../src/components/ui/Button';
import Card, { CardGroup, CardDivider } from '../../src/components/ui/Card';
import PageHeader, { SectionLabel } from '../../src/components/ui/PageHeader';
import NutritionSummary from '../../src/features/fitness-plan/components/NutritionSummary';
import SplitStylePicker from '../../src/features/fitness-plan/components/SplitStylePicker';
import WorkoutDayCard from '../../src/features/fitness-plan/components/WorkoutDayCard';
import { usePlanGenerator } from '../../src/features/fitness-plan/hooks/usePlanGenerator';
import type { WorkoutSplitStyle } from '../../src/types/plan.types';
import { fonts, radius, spacing, typography, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function PlanScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { plan, profile, isLoading, regenerate } = usePlanGenerator();
  const [selectedStyle, setSelectedStyle] = useState<WorkoutSplitStyle>(plan?.splitStyle ?? 'PUSH_PULL_LEGS');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      await regenerate(selectedStyle);
    } finally {
      setIsRegenerating(false);
    }
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Card size="hero" style={styles.emptyCard}>
          <User size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No profile yet</Text>
          <Text style={styles.emptyBody}>Set up your profile so we know what to plan for you.</Text>
          <Button size="lg" fullWidth={false} onPress={() => router.push('/(app)/profile-setup')}>
            Set Up Profile
          </Button>
        </Card>
      </View>
    );
  }

  if (isLoading || !plan) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generating your personalized plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.chip}>
        <Sparkles size={12} color={colors.primaryLight} />
        <Text style={styles.chipText}>AI-Generated Plan</Text>
      </View>
      <PageHeader
        title="Your Fitness Plan"
        subtitle={`Tailored for ${profile.fullName}'s ${profile.goal.replace(/_/g, ' ').toLowerCase()} goal`}
      />

      <SectionLabel>Nutrition Targets</SectionLabel>
      <NutritionSummary nutrition={plan.nutrition} />

      <View style={styles.sectionGap} />
      <SectionLabel>Workout Schedule</SectionLabel>
      <Text style={styles.subLabel}>Split Style</Text>
      <SplitStylePicker selected={selectedStyle} onSelect={setSelectedStyle} />

      <CardGroup style={styles.table}>
        {plan.workoutDays.map((day, i) => (
          <View key={day.day}>
            {i > 0 && <CardDivider />}
            <WorkoutDayCard
              day={day}
              expanded={expandedDay === day.day}
              onToggle={() => setExpandedDay((current) => (current === day.day ? null : day.day))}
            />
          </View>
        ))}
      </CardGroup>

      <View style={styles.actions}>
        <Button variant="secondary" size="md" fullWidth={false} onPress={handleRegenerate} loading={isRegenerating}>
          Regenerate Plan
        </Button>
        <Button size="md" fullWidth={false} onPress={() => router.push('/(app)')}>
          Go to Dashboard
        </Button>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      paddingHorizontal: spacing.md + 4,
      gap: spacing.md,
    },
    loadingText: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.regular },
    emptyCard: { alignItems: 'center', gap: spacing.sm, alignSelf: 'stretch', paddingVertical: spacing.xl },
    emptyTitle: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.sm },
    emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      backgroundColor: colors.primaryMuted,
      borderRadius: radius.full,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginBottom: 12,
    },
    chipText: { color: colors.primaryLight, fontSize: 12, fontFamily: fonts.semibold },
    sectionGap: { height: spacing.md },
    subLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: fonts.medium,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: spacing.sm,
    },
    table: { marginTop: spacing.md },
    actions: { marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  });
}
