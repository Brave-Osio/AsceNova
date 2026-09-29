import { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useLeaderboard } from '../../src/features/leaderboard/hooks/useLeaderboard';
import type { LeaderboardRowData } from '../../src/services/leaderboardService';
import { spacing, typography, radius, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

function Row({ row, colors, styles }: { row: LeaderboardRowData; colors: ColorPalette; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={[styles.row, row.isCurrentUser && styles.rowSelf]}>
      <Text style={styles.position}>#{row.position}</Text>
      <View style={styles.rowInfo}>
        <Text style={styles.name}>{row.name}</Text>
        <Text style={styles.rank}>{row.rank}</Text>
      </View>
      <View style={styles.rowStats}>
        <Text style={styles.xp}>{row.xp} XP</Text>
        <View style={styles.streakRow}>
          <Flame size={11} color={colors.textMuted} />
          <Text style={styles.streak}>{row.streak}</Text>
        </View>
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
    <View style={styles.flex}>
      <FlatList
        data={rows}
        keyExtractor={(row) => String(row.position)}
        contentContainerStyle={styles.container}
        ListHeaderComponent={<Text style={styles.title}>Leaderboard</Text>}
        renderItem={({ item }) => <Row row={item} colors={colors} styles={styles} />}
        ListEmptyComponent={<Text style={styles.empty}>No one&apos;s on the board yet.</Text>}
      />
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    container: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl * 2 },
    title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
    empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    rowSelf: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
    position: { color: colors.textMuted, fontWeight: '700', width: 36 },
    rowInfo: { flex: 1 },
    name: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },
    rank: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    rowStats: { alignItems: 'flex-end' },
    xp: { color: colors.primaryLight, fontWeight: '700', fontSize: 13 },
    streakRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    streak: { color: colors.textMuted, fontSize: 12 },
  });
}
