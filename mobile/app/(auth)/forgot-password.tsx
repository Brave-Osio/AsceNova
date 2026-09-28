import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../src/components/ui/TextField';
import Button from '../../src/components/ui/Button';
import { getErrorMessage } from '../../src/lib/errors';
import { forgotPasswordRequest } from '../../src/services/authService';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../../src/features/auth/schemas';
import { colors, spacing, typography } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsPending(true);
    setError(null);
    try {
      await forgotPasswordRequest(values);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Reset your password</Text>

        {sent ? (
          <Text style={styles.info}>
            If an account with that email exists, a reset link has been sent. Check your email, then use the link on
            the web app to finish resetting your password (mobile doesn&apos;t have its own reset-password screen yet).
          </Text>
        ) : (
          <>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Email"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                />
              )}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button onPress={handleSubmit(onSubmit)} loading={isPending}>
              Send Reset Link
            </Button>
          </>
        )}

        <View style={styles.footer}>
          <Link href="/(auth)/login" style={styles.link}>
            Back to login
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.lg },
  info: { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20 },
  error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  link: { color: colors.violetLight, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: spacing.lg },
});
