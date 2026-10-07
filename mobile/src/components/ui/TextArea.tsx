import { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { fonts, spacing, radius, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface TextAreaProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export default function TextArea({ label, value, onChangeText, placeholder }: TextAreaProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        style={styles.input}
      />
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { marginBottom: spacing.md },
    label: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium, marginBottom: spacing.xs + 2 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: fonts.regular,
      minHeight: 80,
      textAlignVertical: 'top',
    },
  });
}
