import { useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useLeaderboard } from '../../src/features/leaderboard/hooks/useLeaderboard';
import LeaderboardTable from '../../src/features/leaderboard/components/LeaderboardTable';
import PageHeader from '../../src/components/ui/PageHeader';
import { spacing, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function LeaderboardScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { rows, isLoading } = useLeaderboard();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <PageHeader
        eyebrow="Live Rankings"
        title="Consistency Leaderboard"
        subtitle="Ranked by XP, streaks, and achievements, not weight lost."
      />
      <LeaderboardTable rows={rows} isLoading={isLoading} />
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingTop: spacing.md + 4, paddingBottom: spacing.xl * 2 },
  });
}
