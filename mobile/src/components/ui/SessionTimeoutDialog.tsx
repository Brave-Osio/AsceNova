import { useMemo } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import Button from './Button';
import { useAppTheme } from '../../context/ThemeContext';
import { fonts, radius, spacing, typography, type ColorPalette } from '../../theme';

interface SessionTimeoutDialogProps {
  visible: boolean;
  secondsLeft: number;
  onStay: () => void;
  onLogout: () => void;
}

/** Inactivity warning shown shortly before auto-logout. Android back / dismiss means "stay signed in". */
export default function SessionTimeoutDialog({ visible, secondsLeft, onStay, onLogout }: SessionTimeoutDialogProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onStay}>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.titleRow}>
            <Clock size={20} color={colors.primaryLight} />
            <Text style={styles.title}>Still there?</Text>
          </View>
          <Text style={styles.body} accessibilityLiveRegion="polite">
            You&apos;ve been inactive for a while. For your security you&apos;ll be logged out in {secondsLeft}s.
          </Text>
          <View style={styles.buttons}>
            <Button variant="secondary" size="sm" fullWidth={false} onPress={onLogout}>
              Log out now
            </Button>
            <Button size="sm" fullWidth={false} onPress={onStay}>
              Stay signed in
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.md },
    dialog: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg - 4,
      gap: spacing.sm,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...typography.h2, color: colors.textPrimary },
    body: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19 },
    buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  });
}
