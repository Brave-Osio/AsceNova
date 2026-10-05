import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Swords } from 'lucide-react-native';
import { useChallenges } from '../../src/features/challenges/hooks/useChallenges';
import ChallengeCard from '../../src/features/challenges/components/ChallengeCard';
import CreateChallengeForm from '../../src/features/challenges/components/CreateChallengeForm';
import PageHeader from '../../src/components/ui/PageHeader';
import Card from '../../src/components/ui/Card';
import { fonts, spacing, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function ChallengesScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { invites, isLoading } = useChallenges();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>Gamification</Text>
      <PageHeader title="Challenges" subtitle="Start a weekly challenge, solo or with friends." />

      <CreateChallengeForm />

      <View style={styles.list}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : invites.length === 0 ? (
          <Card style={styles.empty}>
            <Swords size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>No challenges yet — start one above.</Text>
          </Card>
        ) : (
          invites.map((invite) => <ChallengeCard key={invite.id} invite={invite} />)
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    eyebrow: { fontSize: 14, fontFamily: fonts.regular, color: colors.textMuted, marginBottom: 4 },
    list: { marginTop: spacing.md, gap: spacing.md },
    empty: { alignItems: 'center', padding: spacing.lg, gap: spacing.sm + 4 },
    emptyText: { fontSize: 14, fontFamily: fonts.regular, color: colors.textSecondary },
  });
}
