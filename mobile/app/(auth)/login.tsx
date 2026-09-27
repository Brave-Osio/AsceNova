import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../src/components/ui/TextField';
import Button from '../../src/components/ui/Button';
import { useAuth } from '../../src/context/AuthContext';
import { getErrorMessage } from '../../src/lib/errors';
import { loginSchema, type LoginFormValues } from '../../src/features/auth/schemas';
import { colors, spacing, typography } from '../../src/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsPending(true);
    setError(null);
    try {
      await login(values);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>
          Asce<Text style={{ color: colors.violet }}>Nova</Text>
        </Text>
        <Text style={styles.title}>Welcome back</Text>

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
              error={errors.password?.message}
            />
          )}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button onPress={handleSubmit(onSubmit)} loading={isPending}>
          Log In
        </Button>

        <Link href="/(auth)/forgot-password" style={styles.link}>
          Forgot password?
        </Link>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" style={styles.link}>
            Sign up
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logo: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  link: { color: colors.violetLight, fontWeight: '600', marginTop: spacing.md, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  footerText: { color: colors.textSecondary },
});
