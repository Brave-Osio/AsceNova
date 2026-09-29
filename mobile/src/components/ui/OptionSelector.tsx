import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { spacing, radius, type ColorPalette } from '../../theme';
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
      <Text style={styles.label}>{label}</Text>
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
    label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    pill: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      paddingVertical: 8,
      paddingHorizontal: spacing.md,
    },
    pillSelected: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
    pillText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    pillTextSelected: { color: colors.primaryLight },
  });
}
