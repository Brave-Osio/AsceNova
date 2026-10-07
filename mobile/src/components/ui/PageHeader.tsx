import { useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-aligned slot (chips, action buttons). */
  right?: ReactNode;
}

/** Every screen's title block — same h1 size/weight and optional subtitle as the web pages. */
export default function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

/** Section label — web `text-xs font-bold uppercase tracking-widest text-muted`. */
export function SectionLabel({ children }: { children: string }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.lg },
    text: { flex: 1 },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { ...typography.subtitle, color: colors.textSecondary, marginTop: spacing.xs },
    sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md },
  });
}
