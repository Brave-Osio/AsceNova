import { useMemo, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../src/components/ui/TextField';
import Button from '../../src/components/ui/Button';
import { getErrorMessage } from '../../src/lib/errors';
import { forgotPasswordRequest } from '../../src/services/authService';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../../src/features/auth/schemas';
import { fonts, spacing, type ColorPalette } from '../../src/theme';
import AuthLayout from '../../src/features/auth/components/AuthLayout';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; devResetToken?: string } | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '', recoveryEmail: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsPending(true);
    setError(null);
    try {
      setResult(await forgotPasswordRequest(values));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email a reset link to your saved Gmail."
      footer={
        <Link href="/(auth)/login" style={styles.link}>
          Back to login
        </Link>
      }
    >

        {result ? (
          <>
            <Text style={styles.info}>
              {result.message} Open the link in your email to finish resetting your password (mobile doesn&apos;t have
              its own reset-password screen, so the link opens the web app).
            </Text>
            {result.devResetToken && (
              <Text style={styles.info}>
                Dev mode only — email isn&apos;t configured. Open this path on the web app:{'\n'}
                /reset-password?token={result.devResetToken}
              </Text>
            )}
          </>
        ) : (
          <>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Username"
                  value={field.value}
                  onChangeText={field.onChange}
                  autoCorrect={false}
                  placeholder="Your username"
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              name="recoveryEmail"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Gmail on your account"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="email-address"
                  autoCorrect={false}
                  placeholder="you@gmail.com"
                  helperText={errors.recoveryEmail ? undefined : 'The Gmail you saved in Settings'}
                  error={errors.recoveryEmail?.message}
                />
              )}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Text style={styles.hint}>
              No Gmail saved on your account? Reset links can&apos;t be sent for it. Add one in Settings while you&apos;re
              logged in.
            </Text>
            <Button onPress={handleSubmit(onSubmit)} loading={isPending}>
              Send Reset Link
            </Button>
          </>
        )}

    </AuthLayout>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    info: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.regular, textAlign: 'center', marginBottom: spacing.md, lineHeight: 20 },
    error: { color: colors.danger, fontSize: 13, fontFamily: fonts.regular, marginBottom: spacing.md, textAlign: 'center' },
    hint: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, textAlign: 'center', marginBottom: spacing.md, lineHeight: 18 },
    link: { color: colors.primaryLight, fontSize: 14, fontFamily: fonts.semibold },
  });
}
