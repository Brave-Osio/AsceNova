import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Beef, Droplets, Dumbbell, Footprints, Moon, Trophy, type LucideIcon } from 'lucide-react-native';
import Card from '../../../components/ui/Card';
import { SectionLabel } from '../../../components/ui/PageHeader';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';
import type { ClientActivityDay, ClientDashboard } from '../../../types/coaching.types';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const HABITS: { key: keyof Omit<ClientActivityDay, 'date'>; label: string; icon: LucideIcon }[] = [
  { key: 'workoutCompleted', label: 'Workout', icon: Dumbbell },
  { key: 'hitWaterGoal', label: 'Water goal', icon: Droplets },
  { key: 'hitProteinGoal', label: 'Protein goal', icon: Beef },
  { key: 'slept7PlusHours', label: 'Slept 7+ hours', icon: Moon },
  { key: 'reachedStepGoal', label: 'Step goal', icon: Footprints },
];

function titleCase(value: string): string {
  return GOAL_LABEL[value] ?? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');
}

export default function ClientDashboardView({ dashboard }: { dashboard: ClientDashboard }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { progress, totals, focus, activity, goals } = dashboard;
  const workouts7d = activity.slice(-7).filter((d) => d.workoutCompleted).length;

  const statusColor = (status: string) =>
    status === 'ACTIVE' ? colors.success : status === 'COMPLETED' ? colors.primaryLight : colors.textMuted;

  const stats = [
    { label: 'Rank', value: titleCase(progress.rank), hint: `${progress.totalXp.toLocaleString()} XP` },
    {
      label: 'Streak',
      value: String(progress.currentStreak),
      hint: `days · longest ${progress.longestStreak}${progress.lastLogDate ? ` · last log ${progress.lastLogDate}` : ''}`,
    },
    { label: 'Workouts', value: String(totals.workoutsCompleted), hint: `${workouts7d} in the last 7 logged days` },
    { label: 'Check-ins', value: String(totals.checkIns), hint: `${totals.achievementsUnlocked} achievements` },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.statGrid}>
        {stats.map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {s.value}
            </Text>
            <Text style={styles.statHint}>{s.hint}</Text>
          </Card>
        ))}
      </View>

      {focus && (
        <Card style={styles.focus}>
          <Text style={styles.statLabel}>FOCUS</Text>
          <Text style={styles.focusValue}>{titleCase(focus.fitnessGoal)}</Text>
          <Text style={styles.focusLevel}>{LEVEL_LABEL[focus.fitnessLevel] ?? focus.fitnessLevel}</Text>
        </Card>
      )}

      <Card>
        <SectionLabel>Habits · last 30 days</SectionLabel>
        {activity.length === 0 ? (
          <Text style={styles.empty}>No check-ins in the last 30 days.</Text>
        ) : (
          <View style={styles.habits}>
            {HABITS.map(({ key, label, icon: Icon }) => {
              const done = activity.filter((d) => d[key]).length;
              return (
                <View key={key} style={styles.habit} accessible accessibilityLabel={`${label}: ${done} of ${activity.length} logged days`}>
                  <View style={styles.habitHeader}>
                    <Icon size={14} color={colors.textSecondary} />
                    <Text style={styles.habitLabel}>{label}</Text>
                    <Text style={styles.habitCount}>
                      {done}/{activity.length}
                    </Text>
                  </View>
                  <View style={styles.dots}>
                    {activity.map((day) => (
                      <View key={day.date} style={[styles.dot, day[key] && { backgroundColor: colors.success }]} />
                    ))}
                  </View>
                </View>
              );
            })}
            <Text style={styles.statHint}>
              {activity[0].date} to {activity[activity.length - 1].date} · logged days only
            </Text>
          </View>
        )}
      </Card>

      <Card>
        <SectionLabel>Goals</SectionLabel>
        {goals.length === 0 ? (
          <Text style={styles.empty}>No goals set.</Text>
        ) : (
          goals.map((g, i) => (
            <View key={g.id} style={[styles.goal, i > 0 && styles.goalDivider]}>
              <Trophy size={14} color={colors.textSecondary} />
              <View style={styles.goalText}>
                <Text style={styles.goalTitle}>{titleCase(g.goalType)}</Text>
                {g.targetDate && <Text style={styles.statHint}>Target {g.targetDate}</Text>}
              </View>
              <Text style={[styles.goalStatus, { color: statusColor(g.status) }]}>{g.status}</Text>
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrap: { gap: spacing.md },
    statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm + 4 },
    statCard: { flexBasis: '47%', flexGrow: 1, padding: spacing.md },
    statLabel: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bold, letterSpacing: 1.4 },
    statValue: { color: colors.textPrimary, fontSize: 28, fontFamily: fonts.extrabold, marginTop: spacing.xs },
    statHint: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, marginTop: 2 },
    focus: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.md, rowGap: 2 },
    focusValue: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.bold },
    focusLevel: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium },
    empty: { color: colors.textMuted, fontSize: 14, fontFamily: fonts.regular },
    habits: { gap: spacing.md },
    habit: { gap: 6 },
    habitHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    habitLabel: { flex: 1, color: colors.textSecondary, fontSize: 13, fontFamily: fonts.medium },
    habitCount: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.semibold },
    dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    dot: { width: 12, height: 12, borderRadius: radius.sm / 2, backgroundColor: colors.cardAlt },
    goal: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm + 2 },
    goalDivider: { borderTopWidth: 1, borderTopColor: colors.border },
    goalText: { flex: 1 },
    goalTitle: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold },
    goalStatus: { fontSize: 11, fontFamily: fonts.bold, letterSpacing: 0.8 },
  });
}
