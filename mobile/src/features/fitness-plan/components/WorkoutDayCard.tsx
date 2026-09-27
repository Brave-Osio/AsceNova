import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { WorkoutDay } from '../../../types/plan.types';
import { colors, spacing, radius } from '../../../theme';

export default function WorkoutDayCard({ day }: { day: WorkoutDay }) {
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
        {hasDetail && <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>}
      </View>

      {expanded && hasDetail && (
        <View style={styles.detail}>
          {day.warmUp && <Text style={styles.meta}>🔥 Warm-up: {day.warmUp}</Text>}
          {day.exercises!.map((ex) => (
            <View key={ex.id} style={styles.exercise}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseMeta}>
                {ex.sets} sets × {ex.reps} · rest {ex.restSeconds}s
                {ex.targetMuscles.length > 0 ? ` · ${ex.targetMuscles.join(', ')}` : ''}
              </Text>
            </View>
          ))}
          {day.coolDown && <Text style={styles.meta}>🧊 Cooldown: {day.coolDown}</Text>}
          {day.coachingTips && day.coachingTips.length > 0 && (
            <Text style={styles.tips}>💡 {day.coachingTips.join(' · ')}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  chevron: { color: colors.textMuted, fontSize: 12 },
  detail: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, gap: spacing.xs },
  meta: { color: colors.textSecondary, fontSize: 12 },
  exercise: { marginVertical: 2 },
  exerciseName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  exerciseMeta: { color: colors.textMuted, fontSize: 11 },
  tips: { color: colors.violetLight, fontSize: 12, marginTop: spacing.xs },
});
