import { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { spacing, radius, fonts, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Turn off for usernames and emails, where autocorrect rewrites what the user typed. */
  autoCorrect?: boolean;
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export default function TextField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoCorrect,
  placeholder,
  error,
  helperText,
}: TextFieldProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, !!error && styles.inputError]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
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
      paddingVertical: 11,
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: fonts.regular,
    },
    inputError: { borderColor: colors.danger },
    error: { color: colors.danger, fontSize: 12, fontFamily: fonts.regular, marginTop: spacing.xs },
    helper: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, marginTop: spacing.xs },
  });
}
