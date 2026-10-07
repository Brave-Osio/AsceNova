import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Flame, Trophy, Shield, Medal, Gem, Star, Sparkles, Crown, type LucideIcon } from 'lucide-react-native';
import { useLeaderboard } from '../../src/features/leaderboard/hooks/useLeaderboard';
import type { LeaderboardRowData } from '../../src/services/leaderboardService';
import type { RankName } from '../../src/types/gamification.types';
import PageHeader from '../../src/components/ui/PageHeader';
import { CardGroup } from '../../src/components/ui/Card';
import { fonts, spacing, radius, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

const RANK_ICON: Record<RankName, LucideIcon> = {
  Iron: Shield,
  Bronze: Medal,
  Silver: Medal,
  Gold: Medal,
  Platinum: Gem,
  Diamond: Gem,
  Ascendant: Star,
  Immortal: Sparkles,
  Radiant: Crown,
};

/** Web --color-rank-* tokens. */
const RANK_COLOR: Record<RankName, string> = {
  Iron: '#6b7280',
  Bronze: '#d97706',
  Silver: '#94a3b8',
  Gold: '#f59e0b',
  Platinum: '#2dd4bf',
  Diamond: '#38bdf8',
  Ascendant: '#4ade80',
  Immortal: '#c084fc',
  Radiant: '#fb7185',
};

/** Web PODIUM_CLASS: tinted circle + tinted text for the top 3. */
const PODIUM: Record<number, { bg: string; fg: string }> = {
  1: { bg: 'rgba(245,158,11,0.15)', fg: '#f59e0b' },
  2: { bg: 'rgba(148,163,184,0.15)', fg: '#94a3b8' },
  3: { bg: 'rgba(234,88,12,0.15)', fg: '#ea580c' },
};

const STREAK_COLOR = '#fb923c';

type Styles = ReturnType<typeof createStyles>;

function Row({ row, colors, styles, last }: { row: LeaderboardRowData; colors: ColorPalette; styles: Styles; last: boolean }) {
  const RankIcon = RANK_ICON[row.rank] ?? Shield;
  const podium = PODIUM[row.position];
  return (
    <View style={[styles.row, !last && styles.rowDivider, row.isCurrentUser && styles.rowSelf]}>
      <View style={[styles.posCircle, podium && { backgroundColor: podium.bg }]}>
        <Text style={[styles.posText, podium && { color: podium.fg }]}>{row.position}</Text>
      </View>
      <View style={styles.nameWrap}>
        <Text style={[styles.name, row.isCurrentUser && styles.nameSelf]} numberOfLines={1}>
          {row.name}
        </Text>
        {row.isCurrentUser && (
          <View style={styles.youChip}>
            <Text style={styles.youText}>YOU</Text>
          </View>
        )}
      </View>
      <RankIcon size={14} color={RANK_COLOR[row.rank] ?? colors.textSecondary} />
      <Text style={styles.xp}>{row.xp.toLocaleString()}</Text>
      <View style={styles.streakWrap}>
        <Flame size={13} color={STREAK_COLOR} />
        <Text style={styles.streak}>{row.streak}</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { rows, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.liveChip}>
        <Trophy size={12} color="#17131f" />
        <Text style={styles.liveChipText}>Live Rankings</Text>
      </View>
      <PageHeader title="Consistency Leaderboard" subtitle="Ranked by XP, streaks, and achievements — not weight lost." />

      <CardGroup>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.headCell, styles.headPos]}>#</Text>
          <Text style={[styles.headCell, styles.headName]}>Name</Text>
          <Text style={styles.headCell}>Rank</Text>
          <Text style={[styles.headCell, styles.headXp]}>XP</Text>
          <Text style={[styles.headCell, styles.headStreak]}>Streak</Text>
        </View>
        {rows.length === 0 ? (
          <Text style={styles.empty}>No one&apos;s on the board yet.</Text>
        ) : (
          rows.map((row, i) => (
            <Row key={`${row.position}-${row.name}`} row={row} colors={colors} styles={styles} last={i === rows.length - 1} />
          ))
        )}
      </CardGroup>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingTop: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    liveChip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      backgroundColor: colors.accent,
      borderRadius: radius.full,
      paddingVertical: 4,
      paddingHorizontal: 12,
      marginBottom: spacing.sm + 4,
    },
    liveChipText: { color: '#17131f', fontSize: 12, fontFamily: fonts.semibold },
    empty: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, textAlign: 'center', padding: spacing.lg },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4, paddingHorizontal: spacing.md, paddingVertical: spacing.md - 2 },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
    rowSelf: { backgroundColor: colors.primaryMuted, borderLeftWidth: 2, borderLeftColor: colors.primary },
    headerRow: { backgroundColor: colors.cardAlt, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.sm + 4 },
    headCell: { ...labelStyle, color: colors.textMuted },
    headPos: { width: 24, textAlign: 'center' },
    headName: { flex: 1 },
    headXp: { minWidth: 44, textAlign: 'right' },
    headStreak: { minWidth: 38, textAlign: 'right' },
    posCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    posText: { fontSize: 12, fontFamily: fonts.bold, color: colors.textMuted },
    nameWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    name: { flexShrink: 1, fontSize: 14, fontFamily: fonts.medium, color: colors.textSecondary },
    nameSelf: { fontFamily: fonts.bold, color: colors.textPrimary },
    youChip: { backgroundColor: colors.primaryMuted, borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 },
    youText: { fontSize: 10, fontFamily: fonts.semibold, color: colors.primaryLight },
    xp: { minWidth: 44, textAlign: 'right', fontSize: 14, fontFamily: fonts.bold, color: colors.primaryLight },
    streakWrap: { minWidth: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
    streak: { fontSize: 14, fontFamily: fonts.semibold, color: STREAK_COLOR },
  });
}

const labelStyle = {
  fontSize: 11,
  fontFamily: fonts.bold,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.4,
};
