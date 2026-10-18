import { useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandLogo from '../../../components/ui/BrandLogo';
import Card from '../../../components/ui/Card';
import { fonts, spacing, typography, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Rendered under the card (e.g. "Don't have an account? Sign up"). */
  footer?: ReactNode;
}

/** The web's auth page: logo, centered h1 + subtitle, then the form in a rounded-3xl card. */
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoRow}>
          <BrandLogo size={34} />
          <Text style={styles.logoText}>AsceNova</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Card size="hero" style={styles.card}>
          {children}
        </Card>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.md + 4 },
    logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
    logoText: { color: colors.textPrimary, fontSize: 20, fontFamily: fonts.extrabold },
    title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center' },
    subtitle: { ...typography.subtitle, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
    card: { marginTop: spacing.lg },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg, flexWrap: 'wrap' },
  });
}
