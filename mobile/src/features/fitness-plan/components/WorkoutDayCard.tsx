import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Clock, Flame, Lightbulb, ChevronUp, ChevronDown } from 'lucide-react-native';
import type { WorkoutDay, WorkoutExercise } from '../../../types/plan.types';
import { fonts, spacing, radius, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

interface WorkoutDayCardProps {
  day: WorkoutDay;
  expanded: boolean;
  onToggle: () => void;
}

const FOCUS_COLORS: Record<string, string> = {
  Rest: '#6b7280',
  Cardio: '#06b6d4',
  'Cardio + Core': '#06b6d4',
  'Cardio Intervals': '#22d3ee',
  'Push Day': '#7c5cfc',
  'Pull Day': '#6366f1',
  'Leg Day': '#f43f5e',
  'Full Body Strength': '#f59e0b',
  'Upper Body Accessory': '#a855f7',
  'Mobility + Core': '#14b8a6',
  'Light Cardio': '#38bdf8',
  'Active Recovery (Walk)': '#22c55e',
};
const DEFAULT_FOCUS_COLOR = '#7c5cfc';
const MUSCLE_TINT = '#22d3ee';

type Styles = ReturnType<typeof createStyles>;

function ExerciseRow({ exercise, styles, colors }: { exercise: WorkoutExercise; styles: Styles; colors: ColorPalette }) {
  return (
    <View style={styles.exercise}>
      <View style={styles.exerciseTop}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseSets} numberOfLines={1}>
          {exercise.sets} × {exercise.reps}
        </Text>
      </View>
      <View style={styles.exerciseMetaRow}>
        <View style={styles.inline}>
          <Clock size={11} color={colors.textMuted} />
          <Text style={styles.exerciseMeta}>{exercise.restSeconds}s rest</Text>
        </View>
        {exercise.tempo ? <Text style={styles.exerciseMeta}>Tempo {exercise.tempo}</Text> : null}
        {exercise.difficulty ? <Text style={styles.exerciseMeta}>{exercise.difficulty.toLowerCase()}</Text> : null}
        {exercise.equipment ? <Text style={styles.exerciseMeta}>{exercise.equipment}</Text> : null}
      </View>
      {exercise.targetMuscles.length > 0 && (
        <View style={styles.muscles}>
          {exercise.targetMuscles.map((muscle) => (
            <View key={muscle} style={styles.muscleChip}>
              <Text style={styles.muscleText}>{muscle}</Text>
            </View>
          ))}
        </View>
      )}
      {exercise.notes ? <Text style={[styles.exerciseMeta, styles.notes]}>{exercise.notes}</Text> : null}
    </View>
  );
}

/** One row of the web's WorkoutTable — rendered inside a CardGroup by the plan screen. */
export default function WorkoutDayCard({ day, expanded, onToggle }: WorkoutDayCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasDetail = !!day.exercises && day.exercises.length > 0;
  const isRest = day.focus.toLowerCase().includes('rest');
  const dot = FOCUS_COLORS[day.focus] ?? DEFAULT_FOCUS_COLOR;

  return (
    <View>
      <Pressable onPress={() => hasDetail && onToggle()} style={[styles.header, isRest && styles.rest]}>
        <View style={styles.headerLeft}>
          <View style={[styles.dot, { backgroundColor: dot }]} />
          <View style={styles.dayText}>
            <Text style={styles.day}>{day.day}</Text>
            {day.workoutName ? <Text style={styles.workoutName}>{day.workoutName}</Text> : null}
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.focusChip, { backgroundColor: `${dot}1a` }]}>
            <Text style={styles.focusText} numberOfLines={1}>
              {day.focus}
            </Text>
          </View>
          {hasDetail &&
            (expanded ? (
              <ChevronUp size={14} color={colors.textMuted} />
            ) : (
              <ChevronDown size={14} color={colors.textMuted} />
            ))}
        </View>
      </Pressable>

      {expanded && hasDetail && (
        <View style={styles.detail}>
          {day.estimatedDurationMinutes ? (
            <View style={styles.statsRow}>
              <View style={styles.inline}>
                <Clock size={12} color={colors.textSecondary} />
                <Text style={styles.body}>{day.estimatedDurationMinutes} min</Text>
              </View>
              {day.estimatedCaloriesBurned ? (
                <View style={styles.inline}>
                  <Flame size={12} color={colors.textSecondary} />
                  <Text style={styles.body}>~{day.estimatedCaloriesBurned} kcal</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          {day.warmUp ? (
            <Text style={styles.body}>
              <Text style={styles.strong}>Warm-up: </Text>
              {day.warmUp}
            </Text>
          ) : null}
          <View style={styles.exercises}>
            {day.exercises?.map((ex) => (
              <ExerciseRow key={ex.id} exercise={ex} styles={styles} colors={colors} />
            ))}
          </View>
          {day.coolDown ? (
            <Text style={styles.body}>
              <Text style={styles.strong}>Cooldown: </Text>
              {day.coolDown}
            </Text>
          ) : null}
          {day.coachingTips && day.coachingTips.length > 0 && (
            <View style={styles.tips}>
              {day.coachingTips.map((tip) => (
                <View key={tip} style={styles.tipRow}>
                  <Lightbulb size={12} color={colors.accentInk} style={styles.tipIcon} />
                  <Text style={[styles.body, styles.tipText]}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
          {day.progressionAdvice ? (
            <Text style={styles.body}>
              <Text style={styles.strong}>Progression: </Text>
              {day.progressionAdvice}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingHorizontal: spacing.md + 4,
      paddingVertical: 14,
    },
    rest: { opacity: 0.5 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
    dot: { width: 8, height: 8, borderRadius: radius.full },
    dayText: { flexShrink: 1 },
    day: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold },
    workoutName: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, marginTop: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
    focusChip: { borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4, flexShrink: 1 },
    focusText: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.semibold },
    detail: {
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md + 4,
      paddingVertical: spacing.md,
    },
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    body: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.regular, lineHeight: 18 },
    strong: { color: colors.textPrimary, fontFamily: fonts.semibold },
    exercises: { gap: spacing.sm },
    exercise: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardAlt,
      borderRadius: radius.md,
      padding: 12,
    },
    exerciseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
    exerciseName: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold, flexShrink: 1, flex: 1, lineHeight: 20 },
    exerciseSets: { color: colors.primaryLight, fontSize: 12, fontFamily: fonts.bold, flexShrink: 0, lineHeight: 20 },
    exerciseMetaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 4, marginTop: 6 },
    exerciseMeta: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular },
    notes: { marginTop: 6 },
    muscles: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
    muscleChip: { backgroundColor: `${MUSCLE_TINT}1a`, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
    muscleText: { color: MUSCLE_TINT, fontSize: 10, fontFamily: fonts.semibold },
    tips: { gap: 4 },
    tipRow: { flexDirection: 'row', gap: 6 },
    tipIcon: { marginTop: 3 },
    tipText: { flex: 1 },
  });
}
