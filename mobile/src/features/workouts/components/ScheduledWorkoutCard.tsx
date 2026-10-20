import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle2, Clock, Dumbbell, Flame, Moon } from 'lucide-react-native';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getErrorMessage } from '../../../lib/errors';
import { fonts, radius, spacing, typography, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';
import { useCompleteWorkout, useWorkoutForDate } from '../hooks/useScheduledWorkout';

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/**
 * The workout scheduled for one date, taken from the user's existing active plan (never generated
 * here), with a "Mark as Done" action. `date` is the user's local calendar day, YYYY-MM-DD.
 */
export default function ScheduledWorkoutCard({ date }: { date: string }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data, isLoading, isError, refetch } = useWorkoutForDate(date);
  const complete = useCompleteWorkout(date);
  const heading = DATE_FORMAT.format(new Date(`${date}T00:00:00`));

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Scheduled workout</Text>
      <Text style={styles.heading}>{heading}</Text>

      {isLoading ? (
        <View style={styles.skeleton} accessibilityLabel="Loading scheduled workout" />
      ) : isError || !data ? (
        <View style={styles.block}>
          <Text style={styles.error}>Couldn&apos;t load the workout for this day.</Text>
          <Button size="sm" variant="secondary" fullWidth={false} onPress={() => refetch()}>
            Retry
          </Button>
        </View>
      ) : !data.hasPlan ? (
        <View style={styles.empty}>
          <Dumbbell size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No workout plan yet</Text>
          <Text style={styles.emptyBody}>Generate your plan to see what&apos;s scheduled each day.</Text>
          <Button size="md" fullWidth={false} onPress={() => router.push('/(app)/plan')}>
            Go to my plan
          </Button>
        </View>
      ) : data.isRestDay || !data.workout ? (
        <View style={styles.empty}>
          <Moon size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Rest day</Text>
          <Text style={styles.emptyBody}>No workout is scheduled for this day. Recovery is part of the plan.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.workoutName}>{data.workout.name ?? data.workout.focus}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{data.workout.dayLabel}</Text>
            {data.workout.estimatedDurationMinutes != null && (
              <View style={styles.metaItem}>
                <Clock size={13} color={colors.textSecondary} />
                <Text style={styles.meta}>{data.workout.estimatedDurationMinutes} min</Text>
              </View>
            )}
            {data.workout.estimatedCaloriesBurned != null && (
              <View style={styles.metaItem}>
                <Flame size={13} color={colors.textSecondary} />
                <Text style={styles.meta}>~{data.workout.estimatedCaloriesBurned} kcal</Text>
              </View>
            )}
          </View>

          {data.workout.warmUp ? (
            <Text style={styles.note}>
              <Text style={styles.noteStrong}>Warm-up: </Text>
              {data.workout.warmUp}
            </Text>
          ) : null}

          <View style={styles.list}>
            {data.workout.exercises.map((exercise, i) => (
              <View key={exercise.id} style={[styles.exercise, i > 0 && styles.exerciseBorder]}>
                <View style={styles.exerciseText}>
                  <Text style={styles.exerciseName}>
                    {i + 1}. {exercise.name}
                  </Text>
                  {(exercise.equipment || exercise.notes) && (
                    <Text style={styles.exerciseNotes}>{[exercise.equipment, exercise.notes].filter(Boolean).join(' · ')}</Text>
                  )}
                </View>
                <View style={styles.exerciseSets}>
                  <Text style={styles.setsText}>
                    {exercise.sets} sets × {exercise.reps} reps
                  </Text>
                  <Text style={styles.rest}>rest {exercise.restSeconds}s</Text>
                </View>
              </View>
            ))}
          </View>

          {data.workout.coolDown ? (
            <Text style={styles.note}>
              <Text style={styles.noteStrong}>Cool-down: </Text>
              {data.workout.coolDown}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {data.completed ? (
              <View style={styles.done} accessibilityRole="text">
                <CheckCircle2 size={16} color={colors.success} />
                <Text style={styles.doneText}>Completed</Text>
              </View>
            ) : (
              <Button fullWidth={false} loading={complete.isPending} onPress={() => complete.mutate(data.workout!.id)}>
                Mark as Done
              </Button>
            )}
            {complete.isError && !data.completed ? <Text style={styles.error}>{getErrorMessage(complete.error)}</Text> : null}
          </View>
        </>
      )}
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: { gap: spacing.xs },
    label: { ...typography.label, color: colors.textMuted },
    heading: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
    skeleton: { height: 72, borderRadius: radius.md, backgroundColor: colors.cardAlt, marginTop: spacing.sm },
    block: { gap: spacing.sm, marginTop: spacing.sm },
    error: { color: colors.danger, fontSize: 13, fontFamily: fonts.regular },
    empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
    emptyTitle: { ...typography.h2, color: colors.textPrimary },
    emptyBody: { ...typography.subtitle, color: colors.textSecondary, textAlign: 'center' },
    workoutName: { color: colors.textPrimary, fontSize: 16, fontFamily: fonts.bold },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.md, rowGap: 2 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    meta: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular },
    note: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19, marginTop: spacing.sm },
    noteStrong: { color: colors.textPrimary, fontFamily: fonts.semibold },
    list: { marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
    exercise: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, padding: spacing.md - 2 },
    exerciseBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    exerciseText: { flex: 1 },
    exerciseName: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold },
    exerciseNotes: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, marginTop: 2 },
    exerciseSets: { alignItems: 'flex-end' },
    setsText: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold },
    rest: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.regular },
    actions: { marginTop: spacing.md, gap: spacing.sm, alignItems: 'flex-start' },
    done: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: 'rgba(52,211,153,0.15)',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    doneText: { color: colors.success, fontSize: 14, fontFamily: fonts.semibold },
  });
}
