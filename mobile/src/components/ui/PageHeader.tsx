import { useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts, spacing, typography, type ColorPalette } from '../../theme';
import { useAppTheme } from '../../context/ThemeContext';

interface PageHeaderProps {
  /** Small muted uppercase label above the title (the section this page belongs to) — plain text, not a pill. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Right-aligned slot (chips, action buttons). */
  right?: ReactNode;
}

/** Every screen's title block — same h1 size/weight and optional subtitle as the web pages. */
export default function PageHeader({ eyebrow, title, subtitle, right }: PageHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
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
    eyebrow: {
      color: colors.textMuted,
      opacity: 0.85,
      fontSize: 11,
      fontFamily: fonts.semibold,
      textTransform: 'uppercase',
      letterSpacing: 1.4,
      marginBottom: 6,
    },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { ...typography.subtitle, color: colors.textSecondary, marginTop: spacing.xs },
    sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md },
  });
}
