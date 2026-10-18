import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Swords } from 'lucide-react-native';
import { useChallenges } from '../../src/features/challenges/hooks/useChallenges';
import ChallengeCard from '../../src/features/challenges/components/ChallengeCard';
import CreateChallengeForm from '../../src/features/challenges/components/CreateChallengeForm';
import PageHeader from '../../src/components/ui/PageHeader';
import { ShowHiddenToggle } from '../../src/components/ui/HideControls';
import { useHiddenIds } from '../../src/lib/useHiddenIds';
import Card from '../../src/components/ui/Card';
import { fonts, spacing, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function ChallengesScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { invites, isLoading } = useChallenges();
  const hidden = useHiddenIds('challenges');
  const [showHidden, setShowHidden] = useState(false);

  const hiddenCount = invites.filter((x) => hidden.isHidden(x.id)).length;
  const visible = showHidden ? invites : invites.filter((x) => !hidden.isHidden(x.id));

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <PageHeader eyebrow="Gamification" title="Challenges" subtitle="Start a weekly challenge, solo or with friends." />

      <CreateChallengeForm />

      <View style={styles.list}>
        <ShowHiddenToggle count={hiddenCount} showing={showHidden} onToggle={() => setShowHidden((v) => !v)} />
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : visible.length === 0 ? (
          <Card style={styles.empty}>
            <Swords size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {invites.length === 0
                ? 'No challenges yet. Start one above to get going.'
                : 'All of your challenges are hidden. Use Show hidden to see them.'}
            </Text>
          </Card>
        ) : (
          visible.map((invite) => (
            <ChallengeCard
              key={invite.id}
              invite={invite}
              isHidden={hidden.isHidden(invite.id)}
              onHide={() => hidden.hide(invite.id)}
              onUnhide={() => hidden.unhide(invite.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    list: { marginTop: spacing.md, gap: spacing.md },
    empty: { alignItems: 'center', padding: spacing.lg, gap: spacing.sm + 4 },
    emptyText: { fontSize: 14, fontFamily: fonts.regular, color: colors.textSecondary },
  });
}
