import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy, Zap, Flame, Award, Shield } from 'lucide-react-native';
import { useUserProgress } from '../../gamification/hooks/useUserProgress';
import { useLogs } from '../../daily-log/hooks/useLogs';
import { ACHIEVEMENTS } from '../../../constants/achievements';
import { RANK_COLOR, RANK_ICON } from '../../../constants/rankVisuals';
import { daysBetween, getTodayDateString, toDateString } from '../../../utils/dateUtils';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

function usePanelStyles() {
  const { colors } = useAppTheme();
  return { colors, styles: useMemo(() => createStyles(colors), [colors]) };
}

export function RankPanel() {
  const { colors, styles } = usePanelStyles();
  const { rank, rankProgress, nextRankThreshold, isLoading } = useUserProgress();
  if (isLoading) return null;
  const RankIcon = RANK_ICON[rank] ?? Shield;
  const rankColor = RANK_COLOR[rank] ?? '#6b7280';

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Current Rank</Text>
      <View style={styles.rankRow}>
        <View style={styles.rankIcon}>
          <RankIcon size={22} strokeWidth={2} color={rankColor} />
        </View>
        <View>
          <Text style={styles.rankName}>{rank}</Text>
          <View style={styles.activeRow}>
            <View style={[styles.dot, { backgroundColor: rankColor }]} />
            <Text style={styles.muted}>Active</Text>
          </View>
        </View>
      </View>
      {nextRankThreshold ? (
        <View style={styles.mt16}>
          <View style={styles.between}>
            <Text style={styles.muted}>Progress to {nextRankThreshold.name}</Text>
            <Text style={styles.muted}>{Math.round(rankProgress * 100)}%</Text>
          </View>
          <View style={styles.smallTrack}>
            <View style={[styles.fill, { width: `${Math.min(rankProgress * 100, 100)}%`, backgroundColor: rankColor }]} />
          </View>
          <Text style={[styles.muted, styles.mt6]}>
            {nextRankThreshold.minXp} XP needed for {nextRankThreshold.name}
          </Text>
        </View>
      ) : (
        <View style={[styles.activeRow, styles.mt16]}>
          <Trophy size={14} color={colors.accentInk} />
          <Text style={styles.highest}>Highest rank reached!</Text>
        </View>
      )}
    </View>
  );
}

export function XpPanel() {
  const { colors, styles } = usePanelStyles();
  const { progress, isLoading } = useUserProgress();
  if (isLoading) return null;
  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Total XP</Text>
      <View style={styles.bigRow}>
        <Text style={styles.big}>{progress.totalXp}</Text>
        <Text style={styles.bigUnit}>XP</Text>
      </View>
      <View style={[styles.activeRow, styles.mt8]}>
        <Zap size={14} color={colors.primaryLight} />
        <Text style={styles.muted}>Keep logging to earn more</Text>
      </View>
    </View>
  );
}

export function AchievementsPanel() {
  const { colors, styles } = usePanelStyles();
  const { unlockedAchievementIds, isLoading } = useUserProgress();
  if (isLoading) return null;
  const earned = ACHIEVEMENTS.filter((a) => unlockedAchievementIds.includes(a.id));
  const unearned = ACHIEVEMENTS.filter((a) => !unlockedAchievementIds.includes(a.id)).slice(0, 3);

  return (
    <View style={styles.panel}>
      <View style={styles.between}>
        <Text style={[styles.label, styles.noMb]}>Achievements</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>
            {earned.length}/{ACHIEVEMENTS.length}
          </Text>
        </View>
      </View>
      {earned.length > 0 ? (
        <View style={styles.badgeWrap}>
          {earned.map((a) => (
            <View key={a.id} style={[styles.badge, { backgroundColor: 'rgba(214,248,76,0.15)' }]}>
              <Award size={18} strokeWidth={2} color={colors.accentInk} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Log your first habit to unlock achievements.</Text>
      )}
      {unearned.length > 0 && (
        <View style={styles.upNext}>
          <Text style={styles.upNextLabel}>Up next:</Text>
          <View style={styles.badgeWrap}>
            {unearned.map((a) => (
              <View key={a.id} style={[styles.badge, { backgroundColor: colors.cardAlt }]}>
                <Award size={18} strokeWidth={2} color={colors.textMuted} />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const DAYS_TO_SHOW = 28;

export function WorkoutCalendarPanel() {
  const { colors, styles } = usePanelStyles();
  const { data: logs = [], isLoading } = useLogs();
  if (isLoading) return <View style={[styles.panel, { minHeight: 192 }]} />;

  const logsByDate = new Map(logs.map((l) => [l.date, l]));
  const today = new Date();
  const todayStr = toDateString(today);
  const days = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (DAYS_TO_SHOW - 1 - i));
    const dateStr = toDateString(d);
    return { dateStr, log: logsByDate.get(dateStr) };
  });
  const noEntry = 'rgba(138,132,153,0.2)';
  const logged = 'rgba(124,92,252,0.25)';

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Workout Calendar</Text>
      <Text style={styles.tiny}>Last {DAYS_TO_SHOW} days</Text>
      <View style={styles.calGrid}>
        {days.map(({ dateStr, log }) => (
          <View key={dateStr} style={styles.calCell}>
            <View
              style={[
                styles.calInner,
                { backgroundColor: log?.habits.workoutCompleted ? colors.primary : log ? logged : noEntry },
                dateStr === todayStr && { borderWidth: 1, borderColor: colors.primaryLight },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        {[
          { c: colors.primary, t: 'Workout' },
          { c: logged, t: 'Logged' },
          { c: noEntry, t: 'No entry' },
        ].map((l) => (
          <View key={l.t} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: l.c }]} />
            <Text style={styles.tiny}>{l.t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function WeeklySummaryPanel() {
  const { colors, styles } = usePanelStyles();
  const { data: logs = [], isLoading } = useLogs();
  if (isLoading) return null;

  const today = getTodayDateString();
  const last7 = logs.filter((l) => {
    const diff = daysBetween(l.date, today);
    return diff >= 0 && diff < 7;
  });
  const daysLogged = last7.length;
  const workoutsCompleted = last7.filter((l) => l.habits.workoutCompleted).length;
  const waterGoalHits = last7.filter((l) => l.habits.hitWaterGoal).length;
  const proteinGoalHits = last7.filter((l) => l.habits.hitProteinGoal).length;
  const sorted = [...last7].sort((a, b) => a.date.localeCompare(b.date));
  const weightChange = sorted.length >= 2 ? sorted[sorted.length - 1].weightKg - sorted[0].weightKg : null;
  const changeColor = weightChange === null ? colors.textSecondary : weightChange < 0 ? colors.success : weightChange > 0 ? colors.danger : colors.textSecondary;

  const rows: { label: string; value: string; color?: string }[] = [
    { label: 'Days logged', value: `${daysLogged}/7` },
    { label: 'Workouts completed', value: `${workoutsCompleted}` },
    { label: 'Water goal hit', value: `${waterGoalHits}/${daysLogged}` },
    { label: 'Protein goal hit', value: `${proteinGoalHits}/${daysLogged}` },
  ];
  if (weightChange !== null) {
    rows.push({ label: 'Weight change', value: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`, color: changeColor });
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>This Week</Text>
      {daysLogged === 0 ? (
        <Text style={styles.empty}>No logs yet this week.</Text>
      ) : (
        <View style={styles.rows}>
          {rows.map((r) => (
            <View key={r.label} style={styles.between}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={[styles.rowValue, r.color ? { color: r.color } : null]}>{r.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function StreakPanel() {
  const { colors, styles } = usePanelStyles();
  const { progress, isLoading } = useUserProgress();
  if (isLoading) return null;
  const streak = progress.currentStreak;
  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Streak</Text>
      <View style={styles.bigRow}>
        <Flame size={26} strokeWidth={2.25} color={colors.accentInk} />
        <Text style={styles.big}>{streak}</Text>
        <Text style={styles.bigUnit}>days</Text>
      </View>
      <Text style={[styles.muted, styles.mt8]}>
        {streak === 0 ? 'Log today to start your streak!' : streak >= 7 ? 'Week streak — legendary!' : 'Keep it going!'}
      </Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    panel: { padding: spacing.md + 4 },
    label: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.textMuted, marginBottom: spacing.sm },
    noMb: { marginBottom: 0 },
    muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
    tiny: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted },
    empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
    mt6: { marginTop: 6 },
    mt8: { marginTop: 8 },
    mt16: { marginTop: 16 },
    between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rankIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
    rankName: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.textPrimary },
    activeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    smallTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.cardAlt, overflow: 'hidden', marginTop: 6 },
    fill: { height: '100%', borderRadius: radius.full },
    highest: { fontFamily: fonts.semibold, fontSize: 12, color: colors.accentInk },
    bigRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 4 },
    big: { fontFamily: fonts.extrabold, fontSize: 36, lineHeight: 40, color: colors.textPrimary },
    bigUnit: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
    chip: { backgroundColor: colors.primaryMuted, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
    chipText: { fontFamily: fonts.bold, fontSize: 12, color: colors.primaryLight },
    badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
    badge: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    upNext: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
    upNextLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
    calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginHorizontal: -3 },
    calCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
    calInner: { flex: 1, borderRadius: 6 },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendSwatch: { width: 8, height: 8, borderRadius: 2 },
    rows: { marginTop: 4, gap: 8 },
    rowLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
    rowValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary },
  });
}
