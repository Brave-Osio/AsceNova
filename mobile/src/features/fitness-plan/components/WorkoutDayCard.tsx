import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Flame, Snowflake, Lightbulb, ChevronUp, ChevronDown } from 'lucide-react-native';
import type { WorkoutDay } from '../../../types/plan.types';
import { spacing, radius, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

export default function WorkoutDayCard({ day }: { day: WorkoutDay }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);
  const hasDetail = !!day.exercises && day.exercises.length > 0;

  return (
    <Pressable
      onPress={() => hasDetail && setExpanded((e) => !e)}
      style={styles.card}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.day}>{day.day}</Text>
          <Text style={styles.focus}>{day.workoutName ?? day.focus}</Text>
        </View>
        {hasDetail && (expanded ? <ChevronUp size={14} color={colors.textMuted} /> : <ChevronDown size={14} color={colors.textMuted} />)}
      </View>

      {expanded && hasDetail && (
        <View style={styles.detail}>
          {day.warmUp && (
            <View style={styles.metaRow}>
              <Flame size={12} color={colors.textSecondary} />
              <Text style={styles.meta}>Warm-up: {day.warmUp}</Text>
            </View>
          )}
          {day.exercises!.map((ex) => (
            <View key={ex.id} style={styles.exercise}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseMeta}>
                {ex.sets} sets × {ex.reps} · rest {ex.restSeconds}s
                {ex.targetMuscles.length > 0 ? ` · ${ex.targetMuscles.join(', ')}` : ''}
              </Text>
            </View>
          ))}
          {day.coolDown && (
            <View style={styles.metaRow}>
              <Snowflake size={12} color={colors.textSecondary} />
              <Text style={styles.meta}>Cooldown: {day.coolDown}</Text>
            </View>
          )}
          {day.coachingTips && day.coachingTips.length > 0 && (
            <View style={styles.metaRow}>
              <Lightbulb size={12} color={colors.accentInk} />
              <Text style={styles.tips}>{day.coachingTips.join(' · ')}</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    day: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    focus: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 2 },
    detail: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, gap: spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    meta: { color: colors.textSecondary, fontSize: 12 },
    exercise: { marginVertical: 2 },
    exerciseName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
    exerciseMeta: { color: colors.textMuted, fontSize: 11 },
    tips: { color: colors.primaryLight, fontSize: 12, flexShrink: 1 },
  });
}
