import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography, type ColorPalette } from '../theme';
import { useAppTheme } from '../context/ThemeContext';

/**
 * Temporary stand-in for screens not yet built out (see the mobile build
 * order in docs/ROADMAP.md Phase 10) — replaced one screen at a time.
 */
export default function ScreenPlaceholder({ icon, title }: { icon: string; title: string }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.lg },
    icon: { fontSize: 40, marginBottom: spacing.md },
    title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
    subtitle: { color: colors.textMuted },
  });
}
