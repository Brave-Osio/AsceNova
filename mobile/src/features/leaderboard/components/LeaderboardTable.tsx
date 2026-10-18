import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight, Flame, Shield, Trophy } from 'lucide-react-native';
import { RANK_COLOR, RANK_ICON } from '../../../constants/rankVisuals';
import RankWings from './RankWings';
import { CardGroup } from '../../../components/ui/Card';
import type { LeaderboardRowData } from '../../../services/leaderboardService';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

export const LEADERBOARD_PAGE_SIZE = 10;

const STREAK_COLOR = '#fb923c';

/** Whole-row treatment for the podium (mirrors the web's PODIUM_ROW): tinted fill + coloured left bar, most prominent first. */
const PODIUM_ROW: Record<number, { bg: string; bar: string; padV: number }> = {
  1: { bg: 'rgba(251,191,36,0.2)', bar: '#fbbf24', padV: 18 },
  2: { bg: 'rgba(148,163,184,0.16)', bar: '#94a3b8', padV: 15 },
  3: { bg: 'rgba(249,115,22,0.16)', bar: '#f97316', padV: 12 },
};

const PODIUM_BADGE: Record<number, { bg: string; fg: string; size: number }> = {
  1: { bg: '#fbbf24', fg: '#451a03', size: 32 },
  2: { bg: '#cbd5e1', fg: '#0f172a', size: 28 },
  3: { bg: '#fb923c', fg: '#431407', size: 28 },
};

type Styles = ReturnType<typeof createStyles>;

function Row({ row, colors, styles, last }: { row: LeaderboardRowData; colors: ColorPalette; styles: Styles; last: boolean }) {
  const isPodium = row.position <= 3;
  const RankIcon = RANK_ICON[row.rank] ?? Shield;
  const tier = RANK_COLOR[row.rank] ?? colors.textSecondary;
  const podium = PODIUM_ROW[row.position];
  const badge = PODIUM_BADGE[row.position];

  return (
    <View
      style={[
        styles.row,
        !last && styles.rowDivider,
        podium
          ? { backgroundColor: podium.bg, borderLeftWidth: 4, borderLeftColor: podium.bar, paddingVertical: podium.padV }
          : { borderLeftWidth: 3, borderLeftColor: `${tier}8c` },
        row.isCurrentUser && styles.rowSelf,
      ]}
    >
      <View style={styles.posWrap}>
        <RankWings position={row.position} />
        <View
          accessibilityLabel={`Position ${row.position}`}
          style={[
            styles.posBadge,
            badge ? { backgroundColor: badge.bg, width: badge.size, height: badge.size, borderRadius: badge.size / 2 } : styles.posBadgePlain,
          ]}
        >
          <Text style={[styles.posText, badge && { color: badge.fg }]}>{row.position}</Text>
        </View>
      </View>

      <View style={styles.nameWrap}>
        <Text style={[styles.name, (row.isCurrentUser || isPodium) && styles.nameStrong, row.position === 1 && styles.nameFirst]} numberOfLines={1}>
          {row.name}
        </Text>
        {row.isCurrentUser && (
          <View style={styles.youChip}>
            <Text style={styles.youText}>YOU</Text>
          </View>
        )}
      </View>

      <View style={[styles.rankPill, { backgroundColor: `${tier}29` }]} accessibilityLabel={row.rank}>
        <RankIcon size={14} color={tier} />
      </View>
      <Text style={styles.xp}>{row.xp.toLocaleString()}</Text>
      <View style={styles.streakWrap}>
        <Flame size={13} color={STREAK_COLOR} />
        <Text style={styles.streak}>{row.streak}</Text>
      </View>
    </View>
  );
}

/** Mirrors the web's LeaderboardTable: podium treatment, tinted rank pills, and 10-per-page pagination. */
export default function LeaderboardTable({ rows, isLoading = false }: { rows: LeaderboardRowData[]; isLoading?: boolean }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [requestedPage, setRequestedPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / LEADERBOARD_PAGE_SIZE));
  // Clamp during render so a shrinking list never leaves us on a page that no longer exists.
  const page = Math.min(requestedPage, totalPages);
  const startIndex = (page - 1) * LEADERBOARD_PAGE_SIZE;
  const pageRows = rows.slice(startIndex, startIndex + LEADERBOARD_PAGE_SIZE);
  const showingFrom = rows.length === 0 ? 0 : startIndex + 1;
  const showingTo = startIndex + pageRows.length;

  return (
    <View>
      <CardGroup>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.headCell, styles.headPos]}>#</Text>
          <Text style={[styles.headCell, styles.headName]}>Name</Text>
          <Text style={styles.headCell}>Rank</Text>
          <Text style={[styles.headCell, styles.headXp]}>XP</Text>
          <Text style={[styles.headCell, styles.headStreak]}>Streak</Text>
        </View>

        {isLoading ? (
          <View style={styles.state} accessibilityLabel="Loading leaderboard">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.state}>
            <Trophy size={32} color={colors.textMuted} />
            <Text style={styles.empty}>No one is on the leaderboard yet. Log a day to claim the first spot.</Text>
          </View>
        ) : (
          pageRows.map((row, i) => (
            <Row key={`${row.position}-${row.name}`} row={row} colors={colors} styles={styles} last={i === pageRows.length - 1} />
          ))
        )}
      </CardGroup>

      {!isLoading && rows.length > 0 && (
        <View style={styles.pager}>
          <Text style={styles.pagerInfo} accessibilityLiveRegion="polite">
            Showing {showingFrom} to {showingTo} of {rows.length}
          </Text>
          <View style={styles.pagerButtons}>
            <Pressable
              onPress={() => setRequestedPage(page - 1)}
              disabled={page <= 1}
              accessibilityRole="button"
              accessibilityLabel="Previous page"
              style={[styles.pagerButton, page <= 1 && styles.pagerDisabled]}
            >
              <ChevronLeft size={14} color={colors.textSecondary} />
              <Text style={styles.pagerButtonText}>Previous</Text>
            </Pressable>
            <Text style={styles.pagerPage}>
              Page {page} of {totalPages}
            </Text>
            <Pressable
              onPress={() => setRequestedPage(page + 1)}
              disabled={page >= totalPages}
              accessibilityRole="button"
              accessibilityLabel="Next page"
              style={[styles.pagerButton, page >= totalPages && styles.pagerDisabled]}
            >
              <Text style={styles.pagerButtonText}>Next</Text>
              <ChevronRight size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const labelStyle = { fontSize: 11, fontFamily: fonts.bold, textTransform: 'uppercase' as const, letterSpacing: 1.4 };

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, paddingHorizontal: spacing.md - 2, paddingVertical: spacing.md - 2 },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
    rowSelf: { borderWidth: 1, borderColor: 'rgba(124,92,252,0.6)' },
    headerRow: { backgroundColor: colors.cardAlt, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.sm + 4 },
    headCell: { ...labelStyle, color: colors.textMuted },
    headPos: { width: 36, textAlign: 'center' },
    headName: { flex: 1 },
    headXp: { minWidth: 44, textAlign: 'right' },
    headStreak: { minWidth: 38, textAlign: 'right' },
    posWrap: { width: 36, height: 32, alignItems: 'center', justifyContent: 'center' },
    posBadge: { alignItems: 'center', justifyContent: 'center' },
    posBadgePlain: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 6, backgroundColor: colors.cardAlt },
    posText: { fontSize: 12, fontFamily: fonts.bold, color: colors.textMuted },
    nameWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    name: { flexShrink: 1, fontSize: 14, fontFamily: fonts.medium, color: colors.textSecondary },
    nameStrong: { fontFamily: fonts.bold, color: colors.textPrimary },
    nameFirst: { fontSize: 15 },
    youChip: { backgroundColor: colors.primaryMuted, borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 },
    youText: { fontSize: 10, fontFamily: fonts.semibold, color: colors.primaryLight },
    rankPill: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 5 },
    xp: { minWidth: 44, textAlign: 'right', fontSize: 14, fontFamily: fonts.bold, color: colors.primaryLight },
    streakWrap: { minWidth: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
    streak: { fontSize: 14, fontFamily: fonts.semibold, color: STREAK_COLOR },
    state: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
    empty: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, textAlign: 'center' },
    pager: { marginTop: spacing.md, gap: spacing.sm + 4 },
    pagerInfo: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular },
    pagerButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    pagerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    pagerDisabled: { opacity: 0.4 },
    pagerButtonText: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.semibold },
    pagerPage: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.semibold },
  });
}
