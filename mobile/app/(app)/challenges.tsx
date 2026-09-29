import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Swords } from 'lucide-react-native';
import { useChallenges } from '../../src/features/challenges/hooks/useChallenges';
import ChallengeCard from '../../src/features/challenges/components/ChallengeCard';
import CreateChallengeForm from '../../src/features/challenges/components/CreateChallengeForm';
import { spacing, typography, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function ChallengesScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { invites, isLoading } = useChallenges();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Challenges</Text>
      <Text style={styles.subtitle}>Start a weekly challenge, solo or with friends.</Text>

      <CreateChallengeForm />

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : invites.length === 0 ? (
        <View style={styles.empty}>
          <Swords size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>No challenges yet — start one above.</Text>
        </View>
      ) : (
        invites.map((invite) => <ChallengeCard key={invite.id} invite={invite} />)
      )}
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl * 2 },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
    empty: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
    emptyText: { color: colors.textMuted },
  });
}
