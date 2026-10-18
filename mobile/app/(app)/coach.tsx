import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import ClientList from '../../src/features/coaching/components/ClientList';
import PageHeader from '../../src/components/ui/PageHeader';
import { spacing, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';

/** Coaches and admins only. Hiding the nav item is cosmetic — /api/coach/* enforces the role and client scope server-side. */
export default function CoachScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { canCoach, isAdmin } = useAuth();

  if (!canCoach) return <Redirect href="/" />;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <PageHeader
        eyebrow="Coach"
        title="Clients"
        subtitle={
          isAdmin
            ? 'As an administrator you can open any account. Coaches only see the clients assigned to them.'
            : 'Check in on the progress of the clients assigned to you.'
        }
      />
      <ClientList />
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingTop: spacing.md + 4, paddingBottom: spacing.xl * 2 },
  });
}
