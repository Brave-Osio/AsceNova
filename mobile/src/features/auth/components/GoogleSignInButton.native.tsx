import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../../context/AuthContext';
import { useAppTheme } from '../../../context/ThemeContext';
import { getErrorMessage } from '../../../lib/errors';
import { fonts, radius, spacing, type ColorPalette } from '../../../theme';

// Must be the *web* OAuth client ID: the ID token's audience is the web client,
// and the server verifies it against GOOGLE_CLIENT_IDS.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

interface GoogleSignInButtonProps {
  label?: string;
  onError: (message: string | null) => void;
}

/** Native-only (the .native suffix keeps this module out of the web bundle). Hidden until a client ID is configured, like the web's button. */
export default function GoogleSignInButton({ label = 'Continue with Google', onError }: GoogleSignInButtonProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { loginWithGoogle } = useAuth();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (WEB_CLIENT_ID) GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
  }, []);

  if (!WEB_CLIENT_ID) return null;

  async function handlePress() {
    setIsPending(true);
    onError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response) || !response.data.idToken) return; // cancelled
      // New accounts land on the Dashboard's "Set Up Profile" empty state.
      await loginWithGoogle(response.data.idToken);
    } catch (err) {
      if (isErrorWithCode(err) && (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS)) {
        return;
      }
      onError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.line} />
      </View>
      <Pressable
        onPress={handlePress}
        disabled={isPending}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, isPending && styles.disabled]}
        accessibilityRole="button"
      >
        {isPending ? (
          <ActivityIndicator size="small" color={colors.primaryLight} />
        ) : (
          <>
            <Text style={styles.g}>G</Text>
            <Text style={styles.text}>{label}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.md },
    line: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.medium },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm + 2,
      paddingVertical: 12,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardAlt,
    },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
    g: { color: '#4285F4', fontSize: 17, fontFamily: fonts.extrabold },
    text: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.semibold },
  });
}
