import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Check, Circle, Droplet, Dumbbell, Footprints, Beef, Moon, ArrowRight, type LucideIcon } from 'lucide-react-native';
import Card from '../../../components/ui/Card';
import { usePlanGenerator } from '../../fitness-plan/hooks/usePlanGenerator';
import { useLogs } from '../../daily-log/hooks/useLogs';
import { useProfile } from '../../profile/hooks/useProfile';
import { getTodayDateString } from '../../../utils/dateUtils';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';
import type { DailyHabits } from '../../../types/log.types';
import TextLink from './TextLink';

interface TargetItem {
  key: keyof DailyHabits;
  label: string;
  target: string;
  icon: LucideIcon;
}

function buildItems(waterLiters: number | undefined, proteinGrams: number | undefined, sleepHours: number | null | undefined): TargetItem[] {
  return [
    { key: 'workoutCompleted', label: 'Workout', target: 'Complete today’s session', icon: Dumbbell },
    { key: 'hitWaterGoal', label: 'Water', target: waterLiters ? `${waterLiters} L` : 'Hit your water goal', icon: Droplet },
    { key: 'hitProteinGoal', label: 'Protein', target: proteinGrams ? `${proteinGrams} g` : 'Hit your protein goal', icon: Beef },
    { key: 'slept7PlusHours', label: 'Sleep', target: `${sleepHours ?? 7}+ hours`, icon: Moon },
    { key: 'reachedStepGoal', label: 'Steps', target: '8,000+ steps', icon: Footprints },
  ];
}

export default function TodayTargetsCard() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { plan, isLoading: isPlanLoading } = usePlanGenerator();
  const { data: logs, isLoading: isLogsLoading } = useLogs();
  const { data: profile } = useProfile();

  if (isPlanLoading || isLogsLoading) {
    return <Card size="hero" style={styles.skeleton}>{null}</Card>;
  }

  const todayLog = logs?.find((l) => l.date === getTodayDateString());
  const items = buildItems(plan?.nutrition.waterLiters, plan?.nutrition.proteinGrams, profile?.sleepHoursTarget);
  const done = todayLog ? items.filter((item) => todayLog.habits[item.key]).length : 0;
  const total = items.length;
  const percent = Math.round((done / total) * 100);
  const remaining = total - done;
  const isComplete = done === total;
  const okColor = colors.success;

  return (
    <Card size="hero">
      <Text style={styles.label}>Today&rsquo;s Target</Text>
      <View style={styles.percentRow}>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.complete}>complete</Text>
      </View>
      <Text style={styles.hits}>
        {done} <Text style={styles.hitsSub}>of {total} targets hit</Text>
      </Text>
      <Text style={[styles.remaining, { color: isComplete ? okColor : colors.textMuted }]}>
        {isComplete ? 'All targets hit — great day!' : `${remaining} remaining`}
      </Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: isComplete ? '#10b981' : colors.primary }]} />
      </View>

      <View style={styles.grid}>
        {items.map((item) => {
          const hit = !!todayLog?.habits[item.key];
          const Icon = item.icon;
          return (
            <View key={item.key} style={[styles.item, hit && styles.itemHit]}>
              <View style={styles.itemTop}>
                <Icon size={16} color={hit ? okColor : colors.textMuted} />
                {hit ? <Check size={14} strokeWidth={3} color={okColor} /> : <Circle size={14} color={colors.textMuted} />}
              </View>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemTarget}>{item.target}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        {plan ? (
          <Text style={styles.footerText}>
            Daily nutrition: <Text style={styles.footerStrong}>{plan.nutrition.calories} kcal</Text> · P {plan.nutrition.proteinGrams}g · C{' '}
            {plan.nutrition.carbsGrams}g · F {plan.nutrition.fatGrams}g
          </Text>
        ) : (
          <TextLink href="/(app)/plan" arrow={false}>
            Generate a plan to see calorie & macro targets →
          </TextLink>
        )}
        {!todayLog && (
          <Pressable onPress={() => router.push('/(app)/log')} style={styles.logBtn}>
            <Text style={styles.logBtnText}>Log today&rsquo;s progress</Text>
            <ArrowRight size={12} color="#fff" />
          </Pressable>
        )}
      </View>
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    skeleton: { height: 224, opacity: 0.6 },
    label: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.textMuted },
    percentRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
    percent: { fontFamily: fonts.extrabold, fontSize: 48, lineHeight: 52, color: colors.textPrimary },
    complete: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
    hits: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary, marginTop: spacing.sm },
    hitsSub: { fontFamily: fonts.medium, color: colors.textSecondary },
    remaining: { fontFamily: fonts.semibold, fontSize: 12, marginTop: 2 },
    track: { height: 16, borderRadius: radius.full, backgroundColor: colors.cardAlt, overflow: 'hidden', marginTop: spacing.md + 4 },
    fill: { height: '100%', borderRadius: radius.full },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: spacing.lg },
    item: {
      width: '47.5%',
      flexGrow: 1,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardAlt,
      padding: 12,
    },
    itemHit: { borderColor: 'rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.1)' },
    itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary, marginTop: spacing.sm },
    itemTarget: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
    footer: { marginTop: spacing.md + 4, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 },
    footerText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
    footerStrong: { fontFamily: fonts.semibold, color: colors.textPrimary },
    logBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    logBtnText: { fontFamily: fonts.bold, fontSize: 12, color: '#fff' },
  });
}
