import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ChallengePreviewCard from './ChallengePreviewCard';
import type { ChallengeTemplate } from '../../../types/challenge.types';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

interface ChallengePickerProps {
  label: string;
  catalog: ChallengeTemplate[];
  value: string;
  onChange: (id: string) => void;
}

/**
 * Mirrors the web's ChallengePicker: challenge selection pills. Touch has no hover, so (like the web's
 * touch behaviour) the selected challenge's real details are always shown in a panel under the pills:
 * tapping a pill selects it and reveals the same information.
 */
export default function ChallengePicker({ label, catalog, value, onChange }: ChallengePickerProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selected = catalog.find((c) => c.id === value) ?? catalog[0];

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pills} accessibilityRole="radiogroup">
        {catalog.map((challenge) => {
          const isSelected = challenge.id === selected.id;
          return (
            <Pressable
              key={challenge.id}
              onPress={() => onChange(challenge.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={[styles.pill, isSelected && styles.pillSelected]}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {challenge.icon} {challenge.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selected && (
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Selected challenge</Text>
          <ChallengePreviewCard challenge={selected} />
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    label: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium, marginBottom: 6 },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    pill: {
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    pillText: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.semibold },
    pillTextSelected: { color: '#ffffff' },
    panel: {
      marginTop: spacing.sm + 4,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardAlt,
      padding: spacing.md,
    },
    panelLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontFamily: fonts.bold,
      textTransform: 'uppercase',
      letterSpacing: 1.4,
      marginBottom: spacing.sm,
    },
  });
}
