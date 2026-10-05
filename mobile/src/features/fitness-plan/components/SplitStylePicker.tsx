import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SPLIT_STYLE_OPTIONS, type WorkoutSplitStyle } from '../../../types/plan.types';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

interface SplitStylePickerProps {
  selected: WorkoutSplitStyle;
  onSelect: (style: WorkoutSplitStyle) => void;
}

/** Mirrors the web's SplitStylePicker — stacked option cards with a description. */
export default function SplitStylePicker({ selected, onSelect }: SplitStylePickerProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.list}>
      {SPLIT_STYLE_OPTIONS.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.option, isSelected && styles.optionSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{option.label}</Text>
            <Text style={styles.description}>{option.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    list: { gap: spacing.sm },
    option: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
    },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
    label: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.semibold },
    labelSelected: { color: colors.textPrimary },
    description: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, marginTop: 2 },
  });
}
