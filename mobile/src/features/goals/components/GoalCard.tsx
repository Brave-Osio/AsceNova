import { useMemo, useRef } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { useGoalActions } from '../hooks/useGoalActions';
import type { Goal } from '../../../types/goal.types';
import { fonts, spacing, radius, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

/** After this many abandon taps on one goal, the confirm dialog adds a stronger warning. */
const REPEAT_WARNING_THRESHOLD = 10;

/** Mirrors the web app's GoalCard.tsx. */
export default function GoalCard({ goal }: { goal: Goal }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { complete, abandon, pendingGoalId } = useGoalActions();
  const isPending = pendingGoalId === goal.id;
  const attempts = useRef(0);

  function handleAbandonPress() {
    attempts.current += 1;
    const warning =
      attempts.current >= REPEAT_WARNING_THRESHOLD
        ? `\n\nYou've tried to abandon this goal ${attempts.current} times — please confirm only if you're sure.`
        : '';
    Alert.alert(
      'Abandon this goal?',
      `It will be marked as abandoned and moved out of your active goals. This can't be undone.${warning}`,
      [
        { text: 'Keep goal', style: 'cancel' },
        { text: 'Yes, abandon', style: 'destructive', onPress: () => void abandon(goal.id) },
      ],
    );
  }

  const badgeStyle =
    goal.status === 'COMPLETED' ? styles.badgeCompleted : goal.status === 'ABANDONED' ? styles.badgeAbandoned : styles.badgeActive;
  const badgeTextStyle =
    goal.status === 'COMPLETED'
      ? styles.badgeTextCompleted
      : goal.status === 'ABANDONED'
        ? styles.badgeTextAbandoned
        : styles.badgeTextActive;

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {GOAL_LABEL[goal.goalType] ?? goal.goalType}
            {goal.targetValue != null && <Text style={styles.target}>{`  Target: ${goal.targetValue}kg`}</Text>}
          </Text>
        </View>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>{goal.status}</Text>
        </View>
      </View>

      {goal.targetDate ? <Text style={styles.date}>{`By ${new Date(goal.targetDate).toLocaleDateString()}`}</Text> : null}
      {goal.progressNote ? <Text style={styles.note}>{goal.progressNote}</Text> : null}

      {goal.status === 'ACTIVE' && (
        <View style={styles.actions}>
          <Button size="sm" fullWidth={false} loading={isPending} onPress={() => void complete(goal.id)}>
            Mark Complete
          </Button>
          <Button size="sm" fullWidth={false} variant="ghost" disabled={isPending} onPress={handleAbandonPress}>
            Abandon
          </Button>
        </View>
      )}
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm + 4 },
    headerText: { flex: 1 },
    title: { color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 15 },
    target: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14 },
    badge: { borderRadius: radius.full, paddingVertical: 2, paddingHorizontal: 8 },
    badgeActive: { backgroundColor: colors.primaryMuted },
    badgeCompleted: { backgroundColor: 'rgba(16,185,129,0.15)' },
    badgeAbandoned: { backgroundColor: colors.cardAlt },
    badgeText: { fontSize: 12, fontFamily: fonts.semibold },
    badgeTextActive: { color: colors.primaryLight },
    badgeTextCompleted: { color: '#10b981' },
    badgeTextAbandoned: { color: colors.textMuted },
    date: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: spacing.sm },
    note: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, marginTop: spacing.sm },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  });
}
