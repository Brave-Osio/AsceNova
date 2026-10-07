import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Dumbbell, Droplet, Beef, Moon, Footprints, NotebookPen } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import TextField from '../../src/components/ui/TextField';
import TextArea from '../../src/components/ui/TextArea';
import CheckboxRow from '../../src/components/ui/Checkbox';
import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';
import PageHeader from '../../src/components/ui/PageHeader';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import { useDailyLog } from '../../src/features/daily-log/hooks/useDailyLog';
import type { DailyHabits } from '../../src/types/log.types';
import { fonts, spacing, radius, typography, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

const HABIT_ITEMS: { key: keyof DailyHabits; label: string; Icon: LucideIcon }[] = [
  { key: 'workoutCompleted', label: 'Workout Completed', Icon: Dumbbell },
  { key: 'hitWaterGoal', label: 'Hit Water Goal (3L)', Icon: Droplet },
  { key: 'hitProteinGoal', label: 'Hit Protein Goal', Icon: Beef },
  { key: 'slept7PlusHours', label: 'Slept 7+ Hours', Icon: Moon },
  { key: 'reachedStepGoal', label: 'Reached Step Goal (8,000+)', Icon: Footprints },
];

export default function LogScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { form, error, lastResult, isSubmitting, updateField, toggleHabit, handleSubmit } = useDailyLog();
  const checkedCount = Object.values(form.habits).filter(Boolean).length;

  if (isProfileLoading) {
    return <View style={styles.flex} />;
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Card size="hero" style={styles.emptyCard}>
          <NotebookPen size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No profile yet</Text>
          <Text style={styles.emptyBody}>Set up your profile before logging a day.</Text>
          <Button size="lg" fullWidth={false} onPress={() => router.push('/(app)/profile-setup')}>
            Set Up Profile
          </Button>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.chip}>
          <NotebookPen size={12} color={colors.primaryLight} />
          <Text style={styles.chipText}>Daily Check-In</Text>
        </View>
        <PageHeader title="Daily Log" subtitle="Log today's progress to keep your streak alive." />

        <View style={styles.form}>
          <TextField
            label="Current Weight (kg)"
            value={form.weightKg}
            onChangeText={(v) => updateField('weightKg', v)}
            keyboardType="numeric"
            placeholder="70"
            error={error ?? undefined}
          />

          <View style={styles.checklist}>
            <View style={styles.checklistHeader}>
              <Text style={styles.checklistLabel}>Today&apos;s Checklist</Text>
              <Text style={styles.checklistCount}>
                {checkedCount} / {HABIT_ITEMS.length} done
              </Text>
            </View>
            <View style={styles.habits}>
              {HABIT_ITEMS.map((item) => (
                <CheckboxRow
                  key={item.key}
                  label={item.label}
                  icon={item.Icon}
                  checked={form.habits[item.key]}
                  onChange={(checked) => toggleHabit(item.key, checked)}
                />
              ))}
            </View>
          </View>

          <TextArea
            label="Notes"
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
            placeholder="How did today go?"
          />

          <Button size="md" fullWidth={false} onPress={handleSubmit} loading={isSubmitting}>
            Save Log
          </Button>
        </View>

        {lastResult && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultXp}>+{lastResult.xpGained} XP gained</Text>
            {lastResult.newAchievementTitles.length > 0 && (
              <Text style={styles.resultAchievement}>
                New achievement{lastResult.newAchievementTitles.length > 1 ? 's' : ''} unlocked:{' '}
                {lastResult.newAchievementTitles.join(', ')}
              </Text>
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, paddingHorizontal: spacing.md + 4 },
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
    form: { gap: spacing.sm },
    checklist: { marginBottom: spacing.md },
    checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.sm },
    checklistLabel: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium },
    checklistCount: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular },
    habits: { gap: spacing.sm },
    resultCard: { marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md },
    resultXp: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.medium },
    resultAchievement: { color: colors.primaryLight, marginTop: spacing.xs, fontSize: 14, fontFamily: fonts.regular },
  });
}
