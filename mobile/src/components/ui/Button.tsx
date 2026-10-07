import { useMemo } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { fonts, radius, spacing, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface ButtonProps {
  children: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  /** Defaults to true (web `fullWidth` form buttons); pass false for inline buttons. */
  fullWidth?: boolean;
}

/** Pill button — mirrors the web's `rounded-full` Button, including its sm/md/lg sizes. */
export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth = true,
}: ButtonProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        fullWidth ? styles.fullWidth : styles.inline,
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
        <Text style={[styles.text, size === 'sm' && styles.textSm, variant !== 'primary' && styles.textSecondary]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    base: {
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sm: { paddingVertical: 8, paddingHorizontal: spacing.md },
    md: { paddingVertical: 13, paddingHorizontal: spacing.lg },
    lg: { paddingVertical: 16, paddingHorizontal: spacing.xl },
    fullWidth: { alignSelf: 'stretch' },
    inline: { alignSelf: 'flex-start' },
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    disabled: { opacity: 0.5 },
    pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
    text: { color: '#fff', fontSize: 14, fontFamily: fonts.bold },
    textSm: { fontSize: 13 },
    textSecondary: { color: colors.primaryLight },
  });
}
