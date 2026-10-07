import { useMemo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Check, type LucideIcon } from 'lucide-react-native';
import { fonts, spacing, radius, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface CheckboxRowProps {
  label: string;
  icon: LucideIcon;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function CheckboxRow({ label, icon: Icon, checked, onChange }: CheckboxRowProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable onPress={() => onChange(!checked)} style={[styles.row, checked && styles.rowChecked]}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Check size={13} color="#fff" strokeWidth={3} />}
      </View>
      <Icon size={16} color={colors.textSecondary} />
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      paddingVertical: 12,
      paddingHorizontal: spacing.md,
    },
    rowChecked: { borderColor: 'rgba(124,92,252,0.5)', backgroundColor: 'rgba(124,92,252,0.1)' },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
    label: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium, flexShrink: 1 },
    labelChecked: { color: colors.textPrimary },
  });
}
