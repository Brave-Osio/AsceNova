import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Dumbbell, Droplet, Beef, Moon, Footprints } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import TextField from '../../src/components/ui/TextField';
import TextArea from '../../src/components/ui/TextArea';
import CheckboxRow from '../../src/components/ui/Checkbox';
import Button from '../../src/components/ui/Button';
import { useDailyLog } from '../../src/features/daily-log/hooks/useDailyLog';
import type { DailyHabits } from '../../src/types/log.types';
import { spacing, typography, radius, type ColorPalette } from '../../src/theme';
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
  const { form, error, lastResult, isSubmitting, updateField, toggleHabit, handleSubmit } = useDailyLog();
  const checkedCount = Object.values(form.habits).filter(Boolean).length;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Daily Log</Text>

        <TextField
          label="Current Weight (kg)"
          value={form.weightKg}
          onChangeText={(v) => updateField('weightKg', v)}
          keyboardType="numeric"
          placeholder="70"
          error={error ?? undefined}
        />

        <View style={styles.checklistHeader}>
          <Text style={styles.checklistLabel}>Today&apos;s Checklist</Text>
          <Text style={styles.checklistCount}>{checkedCount} / {HABIT_ITEMS.length} done</Text>
        </View>
        {HABIT_ITEMS.map((item) => (
          <CheckboxRow
            key={item.key}
            label={item.label}
            icon={item.Icon}
            checked={form.habits[item.key]}
            onChange={(checked) => toggleHabit(item.key, checked)}
          />
        ))}

        <TextArea label="Notes" value={form.notes} onChangeText={(v) => updateField('notes', v)} placeholder="How did today go?" />

        <Button onPress={handleSubmit} loading={isSubmitting}>
          Save Log
        </Button>

        {lastResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultXp}>+{lastResult.xpGained} XP gained</Text>
            {lastResult.newAchievementTitles.length > 0 && (
              <Text style={styles.resultAchievement}>
                New achievement{lastResult.newAchievementTitles.length > 1 ? 's' : ''} unlocked:{' '}
                {lastResult.newAchievementTitles.join(', ')}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl * 2 },
    title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
    checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.sm },
    checklistLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
    checklistCount: { color: colors.textMuted, fontSize: 12 },
    resultCard: {
      marginTop: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    resultXp: { color: colors.textPrimary, fontWeight: '700' },
    resultAchievement: { color: colors.primaryLight, marginTop: spacing.xs, fontSize: 13 },
  });
}
