import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme';

interface CheckboxRowProps {
  label: string;
  icon: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function CheckboxRow({ label, icon, checked, onChange }: CheckboxRowProps) {
  return (
    <Pressable onPress={() => onChange(!checked)} style={[styles.row, checked && styles.rowChecked]}>
      <Text style={styles.checkbox}>{checked ? '☑️' : '⬜'}</Text>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  rowChecked: { borderColor: colors.violet, backgroundColor: 'rgba(124,58,237,0.1)' },
  checkbox: { fontSize: 16 },
  icon: { fontSize: 16 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  labelChecked: { color: colors.textPrimary },
});
