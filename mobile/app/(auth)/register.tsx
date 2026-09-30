import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../src/components/ui/TextField';
import Button from '../../src/components/ui/Button';
import { useAuth } from '../../src/context/AuthContext';
import { getErrorMessage } from '../../src/lib/errors';
import { registerSchema, type RegisterFormValues } from '../../src/features/auth/schemas';
import { spacing, typography, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { register } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', recoveryEmail: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsPending(true);
    setError(null);
    try {
      await register({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        recoveryEmail: values.recoveryEmail || undefined,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>

        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <TextField
              label="Full Name"
              value={field.value}
              onChangeText={field.onChange}
              autoCapitalize="words"
              placeholder="Juan Dela Cruz"
              error={errors.fullName?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              label="Username"
              value={field.value}
              onChangeText={field.onChange}
              autoCorrect={false}
              placeholder="juandelacruz"
              helperText={errors.email ? undefined : 'You will log in with this'}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          name="recoveryEmail"
          control={control}
          render={({ field }) => (
            <TextField
              label="Gmail (optional)"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="email-address"
              autoCorrect={false}
              placeholder="you@gmail.com"
              helperText={
                errors.recoveryEmail
                  ? undefined
                  : 'Used only to send a password reset link — you can add it later in Settings'
              }
              error={errors.recoveryEmail?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              label="Password"
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              placeholder="••••••••"
              helperText={errors.password ? undefined : 'At least 8 characters'}
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              label="Confirm Password"
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
            />
          )}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button onPress={handleSubmit(onSubmit)} loading={isPending}>
          Sign Up
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.link}>
            Log in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
    title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.lg },
    error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
    link: { color: colors.primaryLight, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
    footerText: { color: colors.textSecondary },
  });
}
