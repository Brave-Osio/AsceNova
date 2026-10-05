import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Bot } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { usePlanGenerator } from '../../fitness-plan/hooks/usePlanGenerator';
import { getChatHistory } from '../../../services/coachService';
import { queryKeys } from '../../../lib/queryKeys';
import { fonts, radius, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';
import type { WorkoutDay } from '../../../types/plan.types';
import TextLink from './TextLink';

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function isRestDay(day: WorkoutDay): boolean {
  return day.focus.toLowerCase().includes('rest');
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function useCardStyles() {
  const { colors } = useAppTheme();
  return { colors, styles: useMemo(() => createStyles(colors), [colors]) };
}

export function NextWorkoutCard() {
  const { styles, colors } = useCardStyles();
  const { plan, isLoading } = usePlanGenerator();
  if (isLoading) return null;

  if (!plan || plan.workoutDays.length === 0) {
    return (
      <Card>
        <Text style={styles.label}>Next Workout</Text>
        <Text style={styles.empty}>Generate a plan to see your next workout.</Text>
      </Card>
    );
  }

  const todayLabel = WEEKDAY_LABELS[new Date().getDay()];
  const todayIndex = plan.workoutDays.findIndex((d) => d.day === todayLabel);
  const anchorIndex = todayIndex === -1 ? 0 : todayIndex;
  let target = plan.workoutDays[anchorIndex];
  let isToday = true;
  if (isRestDay(target)) {
    for (let offset = 1; offset <= plan.workoutDays.length; offset++) {
      const candidate = plan.workoutDays[(anchorIndex + offset) % plan.workoutDays.length];
      if (!isRestDay(candidate)) {
        target = candidate;
        isToday = false;
        break;
      }
    }
  }
  const exerciseCount = target.exercises?.length ?? 0;

  return (
    <Card>
      <Text style={styles.label}>{isToday ? "Today's Workout" : 'Next Workout'}</Text>
      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{isToday ? 'Today' : target.day}</Text>
        </View>
        {target.estimatedDurationMinutes ? (
          <View style={styles.inline}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={styles.muted}>{target.estimatedDurationMinutes} min</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title}>{target.workoutName ?? target.focus}</Text>
      {target.workoutName ? <Text style={styles.muted}>{target.focus}</Text> : null}
      {exerciseCount > 0 && <Text style={[styles.muted, styles.mt6]}>{exerciseCount} exercises</Text>}
      <View style={styles.link}>
        <TextLink href="/(app)/plan">View full plan</TextLink>
      </View>
    </Card>
  );
}

export function CoachTeaserCard() {
  const { styles, colors } = useCardStyles();
  const { user } = useAuth();
  const { data: messages, isLoading } = useQuery({
    queryKey: queryKeys.coach.history(user?.id ?? ''),
    queryFn: getChatHistory,
    enabled: !!user?.id,
  });
  if (isLoading) return null;

  const last = [...(messages ?? [])].reverse().find((m) => m.sender === 'coach');

  return (
    <Card>
      <View style={styles.inline}>
        <Bot size={16} color={colors.primaryLight} />
        <Text style={[styles.label, styles.noMb]}>AI Coach</Text>
      </View>
      {last ? (
        <Text style={styles.body} numberOfLines={4}>
          {stripMarkdown(last.text)}
        </Text>
      ) : (
        <Text style={[styles.body, { color: colors.textMuted }]}>Ask your coach anything about training, recovery, or your progress.</Text>
      )}
      <View style={styles.link}>
        <TextLink href="/(app)/coach">Continue chatting</TextLink>
      </View>
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    label: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.textMuted, marginBottom: 8 },
    noMb: { marginBottom: 0 },
    empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: 12 },
    chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    chip: { backgroundColor: colors.primaryMuted, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 2 },
    chipText: { fontFamily: fonts.bold, fontSize: 12, color: colors.primaryLight },
    inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
    mt6: { marginTop: 6 },
    title: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.textPrimary, marginTop: 8 },
    body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginTop: 12 },
    link: { marginTop: 12 },
  });
}
