import { useMemo, type ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { radius, spacing, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface CardProps {
  children: ReactNode;
  /** `hero` = the web's rounded-3xl cards (auth, today's targets); default is rounded-2xl. */
  size?: 'default' | 'hero';
  style?: StyleProp<ViewStyle>;
}

/** The web's `.card`. */
export default function Card({ children, size = 'default', style }: CardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.card, size === 'hero' && styles.hero, style]}>{children}</View>;
}

/** The web's `.card-group`: several sections sharing one panel, separated by dividers. */
export function CardGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.card, styles.group, style]}>{children}</View>;
}

export function CardDivider() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={styles.divider} />;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md + 4,
    },
    hero: { borderRadius: radius.xl, padding: spacing.lg },
    group: { padding: 0, overflow: 'hidden' },
    divider: { height: 1, backgroundColor: colors.border },
  });
}
