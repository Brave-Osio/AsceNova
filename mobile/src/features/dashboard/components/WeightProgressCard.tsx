import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import Card from '../../../components/ui/Card';
import SimpleLineChart from '../../../components/charts/SimpleLineChart';
import { useLogs } from '../../daily-log/hooks/useLogs';
import { useProfile } from '../../profile/hooks/useProfile';
import { fonts, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';
import TextLink from './TextLink';

export default function WeightProgressCard() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: logs = [], isLoading } = useLogs();
  const { data: profile } = useProfile();

  if (isLoading) return <Card size="hero" style={styles.skeleton}>{null}</Card>;

  if (logs.length === 0) {
    return (
      <Card size="hero">
        <Text style={styles.label}>Weight Progress</Text>
        <View style={styles.empty}>
          <TrendingUp size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>Your weight trend will appear here once you start logging.</Text>
          <TextLink href="/(app)/log" arrow={false}>
            Log your weight →
          </TextLink>
        </View>
      </Card>
    );
  }

  const chartData = logs.map((log) => ({ label: log.date.slice(5), value: log.weightKg }));
  const latestWeight = logs[logs.length - 1].weightKg;
  const firstWeight = logs[0].weightKg;
  const delta = latestWeight - firstWeight;
  const goalWeight = profile?.goalWeightKg ?? null;
  const toGoal = goalWeight != null ? latestWeight - goalWeight : null;
  const deltaColor = logs.length > 1 ? (delta < 0 ? colors.success : delta > 0 ? colors.danger : colors.textPrimary) : colors.textPrimary;

  const stats: { label: string; value: string; color?: string }[] = [
    { label: 'Current', value: `${latestWeight} kg` },
    { label: 'Starting', value: `${firstWeight} kg` },
    { label: 'Change', value: logs.length > 1 ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg` : '—', color: deltaColor },
  ];
  if (goalWeight != null && toGoal != null) {
    stats.push({
      label: `Goal · ${goalWeight} kg`,
      value: Math.abs(toGoal) < 0.05 ? 'Reached!' : `${Math.abs(toGoal).toFixed(1)} kg ${toGoal > 0 ? 'to lose' : 'to gain'}`,
    });
  }

  return (
    <Card size="hero">
      <Text style={styles.label}>Weight Progress</Text>
      <View style={styles.stats}>
        {stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, s.color ? { color: s.color } : null]}>{s.value}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.entries}>
        {logs.length} {logs.length === 1 ? 'entry' : 'entries'} logged
      </Text>
      <View style={styles.chart}>
        <SimpleLineChart data={chartData} unitLabel="kg" height={240} />
      </View>
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    skeleton: { height: 320, opacity: 0.6 },
    label: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.textMuted },
    empty: { alignItems: 'center', gap: 12, paddingVertical: spacing.lg, marginTop: spacing.md },
    emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
    stats: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 20, columnGap: 16, marginTop: spacing.md },
    stat: { width: '46%' },
    statLabel: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.textMuted },
    statValue: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.textPrimary, marginTop: 2 },
    entries: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: spacing.md },
    chart: { marginTop: spacing.md },
  });
}
