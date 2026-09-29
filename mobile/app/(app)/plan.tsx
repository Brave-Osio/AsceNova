import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { User, Sparkles } from 'lucide-react-native';
import OptionSelector from '../../src/components/ui/OptionSelector';
import Button from '../../src/components/ui/Button';
import NutritionSummary from '../../src/features/fitness-plan/components/NutritionSummary';
import WorkoutDayCard from '../../src/features/fitness-plan/components/WorkoutDayCard';
import { usePlanGenerator } from '../../src/features/fitness-plan/hooks/usePlanGenerator';
import type { WorkoutSplitStyle } from '../../src/types/plan.types';
import { spacing, typography, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

const SPLIT_OPTIONS: { value: WorkoutSplitStyle; label: string }[] = [
  { value: 'PUSH_PULL_LEGS', label: 'Push / Pull / Legs' },
  { value: 'UPPER_LOWER', label: 'Upper / Lower' },
  { value: 'FULL_BODY', label: 'Full Body' },
];

export default function PlanScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { plan, profile, isLoading, regenerate } = usePlanGenerator();
  const [selectedStyle, setSelectedStyle] = useState<WorkoutSplitStyle>(plan?.splitStyle ?? 'PUSH_PULL_LEGS');
  const [isRegenerating, setIsRegenerating] = useState(false);

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
      <View style={styles.emptyContainer}>
        <User size={40} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No profile yet</Text>
        <Text style={styles.emptyBody}>Set up your profile so we know what to plan for you.</Text>
        <Button onPress={() => router.push('/(app)/profile-setup')}>Set Up Profile</Button>
      </View>
    );
  }

  if (isLoading || !plan) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generating your personalized plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.eyebrowRow}>
        <Sparkles size={12} color={colors.primaryLight} />
        <Text style={styles.eyebrow}>AI-Generated Plan</Text>
      </View>
      <Text style={styles.title}>Your Fitness Plan</Text>
      <Text style={styles.subtitle}>
        Tailored for {profile.fullName}&apos;s {profile.goal.replace(/_/g, ' ').toLowerCase()} goal
      </Text>

      <Text style={styles.sectionHeading}>Nutrition Targets</Text>
      <NutritionSummary nutrition={plan.nutrition} />

      <Text style={styles.sectionHeading}>Split Style</Text>
      <OptionSelector label="" value={selectedStyle} options={SPLIT_OPTIONS} onChange={setSelectedStyle} />

      <Text style={styles.sectionHeading}>Workout Schedule</Text>
      {plan.workoutDays.map((day) => (
        <WorkoutDayCard key={day.day} day={day} />
      ))}

      <View style={styles.actions}>
        <Button variant="secondary" onPress={handleRegenerate} loading={isRegenerating}>
          Regenerate Plan
        </Button>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl * 2 },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, gap: spacing.md },
    loadingText: { color: colors.textSecondary },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.md },
    emptyTitle: { ...typography.h2, color: colors.textPrimary },
    emptyBody: { color: colors.textSecondary, textAlign: 'center' },
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    eyebrow: { color: colors.primaryLight, fontSize: 12, fontWeight: '700' },
    title: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.xs },
    subtitle: { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.md },
    sectionHeading: { ...typography.label, color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm },
    actions: { marginTop: spacing.lg },
  });
}
