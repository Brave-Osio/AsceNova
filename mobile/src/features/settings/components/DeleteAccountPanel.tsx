import { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import { useAuth } from '../../../context/AuthContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { queryClient } from '../../../lib/queryClient';
import { getErrorMessage } from '../../../lib/errors';
import { getGoogleIdTokenForReauth, googleReauthAvailable } from '../../auth/googleReauth';
import { fonts, radius, spacing, typography, type ColorPalette } from '../../../theme';

const CONFIRM_WORD = 'DELETE';

/**
 * Self-service permanent account deletion (mirrors the web DeleteAccountPanel). Deliberately
 * multi-step: a dialog explains what is erased, the user must type DELETE and re-prove who they are
 * (password, or a fresh Google credential for Google-only accounts). On success the auth context drops
 * the session, and the protected-route guard sends the user to the login screen.
 */
export default function DeleteAccountPanel() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, deleteAccount } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usesPassword = user?.hasPassword !== false;
  const canSubmit = confirmation === CONFIRM_WORD && (usesPassword ? password.length > 0 : googleToken !== null);

  function close() {
    if (isDeleting) return;
    setIsOpen(false);
    setConfirmation('');
    setPassword('');
    setGoogleToken(null);
    setError(null);
  }

  async function handleGoogle() {
    setIsGooglePending(true);
    setError(null);
    try {
      const token = await getGoogleIdTokenForReauth();
      if (token) setGoogleToken(token);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsGooglePending(false);
    }
  }

  async function handleDelete() {
    if (!user || !canSubmit || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAccount(
        usesPassword ? { confirmation: CONFIRM_WORD, password } : { confirmation: CONFIRM_WORD, idToken: googleToken ?? '' },
      );
      // The account no longer exists server-side; drop everything cached here too. The route guard takes over.
      queryClient.clear();
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't delete your account. Please check your details and try again."));
      setPassword('');
      setGoogleToken(null);
      setIsDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <View style={styles.box}>
        <Text style={styles.boxText}>Permanently delete your account and the personal data tied to it. This can&apos;t be undone.</Text>
        <Button variant="secondary" size="sm" fullWidth={false} onPress={() => setIsOpen(true)}>
          Delete Account
        </Button>
      </View>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.dialog} accessibilityViewIsModal>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.dialogContent}>
              <View style={styles.titleRow}>
                <AlertTriangle size={20} color={colors.danger} />
                <Text style={styles.title}>Delete your account?</Text>
              </View>
              <Text style={styles.body}>This permanently erases:</Text>
              {[
                'your profile, workout plans and daily logs',
                'weight, water and workout history, XP, ranks and achievements',
                'your coach conversations, goals and notifications',
                'your sign-in details and all active sessions',
              ].map((item) => (
                <Text key={item} style={styles.bullet}>
                  • {item}
                </Text>
              ))}
              <Text style={styles.body}>
                Your account is removed immediately and cannot be recovered. Encrypted database backups kept by our hosting provider may
                retain copies until they expire on their own schedule, and anything already sent to the AI provider to generate plans or
                coach replies is outside our control.
              </Text>

              <View style={styles.fields}>
                <TextField
                  label={`Type ${CONFIRM_WORD} to confirm`}
                  value={confirmation}
                  onChangeText={setConfirmation}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder={CONFIRM_WORD}
                />
                {usesPassword ? (
                  <TextField label="Your password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
                ) : googleReauthAvailable ? (
                  googleToken ? (
                    <Text style={styles.ok}>Google confirmed. You can delete your account now.</Text>
                  ) : (
                    <Button variant="secondary" size="md" loading={isGooglePending} onPress={handleGoogle}>
                      Confirm with Google
                    </Button>
                  )
                ) : (
                  <Text style={styles.error}>
                    Google confirmation isn&apos;t available in this build, so this account can&apos;t be deleted from here.
                  </Text>
                )}
                {error ? <Text style={styles.error}>{error}</Text> : null}
              </View>

              <View style={styles.buttons}>
                <Button variant="secondary" size="sm" fullWidth={false} disabled={isDeleting} onPress={close}>
                  Cancel
                </Button>
                <Button size="sm" fullWidth={false} loading={isDeleting} disabled={!canSubmit} onPress={handleDelete}>
                  Delete my account
                </Button>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    box: {
      gap: spacing.md,
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: 'rgba(248,113,113,0.35)',
      backgroundColor: 'rgba(248,113,113,0.06)',
      borderRadius: radius.md,
      padding: spacing.md,
    },
    boxText: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19 },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.md },
    dialog: {
      maxHeight: '90%',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dialogContent: { padding: spacing.lg - 4, gap: spacing.sm },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...typography.h2, color: colors.textPrimary },
    body: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19 },
    bullet: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, paddingLeft: spacing.sm },
    fields: { marginTop: spacing.sm, gap: spacing.sm },
    ok: { color: colors.success, fontSize: 13, fontFamily: fonts.medium },
    error: { color: colors.danger, fontSize: 13, fontFamily: fonts.regular },
    buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  });
}
