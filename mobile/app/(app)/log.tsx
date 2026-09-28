import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import TextField from '../../src/components/ui/TextField';
import TextArea from '../../src/components/ui/TextArea';
import CheckboxRow from '../../src/components/ui/Checkbox';
import Button from '../../src/components/ui/Button';
import { useDailyLog } from '../../src/features/daily-log/hooks/useDailyLog';
import type { DailyHabits } from '../../src/types/log.types';
import { colors, spacing, typography, radius } from '../../src/theme';

const HABIT_ITEMS: { key: keyof DailyHabits; label: string; icon: string }[] = [
  { key: 'workoutCompleted', label: 'Workout Completed', icon: '💪' },
  { key: 'hitWaterGoal', label: 'Hit Water Goal (3L)', icon: '💧' },
  { key: 'hitProteinGoal', label: 'Hit Protein Goal', icon: '🍗' },
  { key: 'slept7PlusHours', label: 'Slept 7+ Hours', icon: '😴' },
  { key: 'reachedStepGoal', label: 'Reached Step Goal (8,000+)', icon: '👟' },
];

export default function LogScreen() {
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
            icon={item.icon}
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

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl * 2 },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.sm },
  checklistLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  checklistCount: { color: colors.textMuted, fontSize: 12 },
  resultCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  resultXp: { color: colors.textPrimary, fontWeight: '700' },
  resultAchievement: { color: colors.violetLight, marginTop: spacing.xs, fontSize: 13 },
});
