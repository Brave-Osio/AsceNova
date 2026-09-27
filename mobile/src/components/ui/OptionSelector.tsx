import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';

interface OptionSelectorProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Mirrors the web app's src/components/ui/OptionSelector.tsx — pill/chip single-select. */
export default function OptionSelector<T extends string>({ label, value, options, onChange }: OptionSelectorProps<T>) {
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

const styles = StyleSheet.create({
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
  pillSelected: { borderColor: colors.violet, backgroundColor: 'rgba(124,58,237,0.15)' },
  pillText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  pillTextSelected: { color: colors.violetLight },
});
