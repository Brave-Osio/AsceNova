import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLeaderboard } from '../../src/features/leaderboard/hooks/useLeaderboard';
import type { LeaderboardRowData } from '../../src/services/leaderboardService';
import { colors, spacing, typography, radius } from '../../src/theme';

function Row({ row }: { row: LeaderboardRowData }) {
  return (
    <View style={[styles.row, row.isCurrentUser && styles.rowSelf]}>
      <Text style={styles.position}>#{row.position}</Text>
      <View style={styles.rowInfo}>
        <Text style={styles.name}>{row.name}</Text>
        <Text style={styles.rank}>{row.rank}</Text>
      </View>
      <View style={styles.rowStats}>
        <Text style={styles.xp}>{row.xp} XP</Text>
        <Text style={styles.streak}>🔥 {row.streak}</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { rows, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.violet} />
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
        renderItem={({ item }) => <Row row={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No one's on the board yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  rowSelf: { borderColor: colors.violet, backgroundColor: 'rgba(124,58,237,0.1)' },
  position: { color: colors.textMuted, fontWeight: '700', width: 36 },
  rowInfo: { flex: 1 },
  name: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },
  rank: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  rowStats: { alignItems: 'flex-end' },
  xp: { color: colors.violetLight, fontWeight: '700', fontSize: 13 },
  streak: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
