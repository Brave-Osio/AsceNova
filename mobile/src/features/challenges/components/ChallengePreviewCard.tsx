import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Sparkles, Target, Users, type LucideIcon } from 'lucide-react-native';
import { describeDuration, describeObjective, describeReward } from '../challengeInfo';
import type { ChallengeTemplate } from '../../../types/challenge.types';
import { fonts, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

/** Mirrors the web's ChallengePreviewCard: compact details for one challenge template. */
export default function ChallengePreviewCard({ challenge }: { challenge: ChallengeTemplate }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const reward = describeReward(challenge);
  const rows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Target, label: 'Objective', value: describeObjective(challenge) },
    { icon: Clock, label: 'Duration', value: describeDuration(challenge) },
    ...(reward ? [{ icon: Sparkles, label: 'Reward', value: reward }] : []),
    { icon: Users, label: 'Who can join', value: "Start solo, or invite friends by username. Each person's progress is tracked separately." },
  ];

  return (
    <View>
      <Text style={styles.title}>
        {challenge.icon} {challenge.title}
      </Text>
      <Text style={styles.description}>{challenge.description}</Text>
      <View style={styles.rows}>
        {rows.map(({ icon: Icon, label, value }) => (
          <View key={label} style={styles.row}>
            <Icon size={13} color={colors.primaryLight} style={styles.icon} />
            <Text style={styles.value}>
              <Text style={styles.label}>{label}: </Text>
              {value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    title: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.bold },
    description: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.regular, lineHeight: 18, marginTop: 4 },
    rows: { marginTop: spacing.sm + 4, gap: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    icon: { marginTop: 2 },
    label: { color: colors.textPrimary, fontFamily: fonts.semibold },
    value: { flex: 1, color: colors.textSecondary, fontSize: 12, fontFamily: fonts.regular, lineHeight: 18 },
  });
}
