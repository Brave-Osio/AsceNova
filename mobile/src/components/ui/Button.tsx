import { useMemo } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { radius, spacing, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface ButtonProps {
  children: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({ children, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primaryLight} size="small" />
      ) : (
        <Text style={[styles.text, variant !== 'primary' && styles.textSecondary]}>{children}</Text>
      )}
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    base: {
      borderRadius: radius.sm,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
    text: { color: '#fff', fontSize: 15, fontWeight: '700' },
    textSecondary: { color: colors.primaryLight },
  });
}
