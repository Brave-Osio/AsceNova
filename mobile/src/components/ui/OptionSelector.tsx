import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { fonts, radius, spacing, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface OptionSelectorProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Mirrors the web app's src/components/ui/OptionSelector.tsx — pill/chip single-select. */
export default function OptionSelector<T extends string>({ label, value, options, onChange }: OptionSelectorProps<T>) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.pill, selected && styles.pillSelected]}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { marginBottom: spacing.md },
    label: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium, marginBottom: spacing.xs + 2 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    pill: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.full,
      paddingVertical: 8,
      paddingHorizontal: spacing.md,
    },
    pillSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
    pillText: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.semibold },
    pillTextSelected: { color: '#fff' },
  });
}
