import { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../src/components/ui/TextField';
import Button from '../../src/components/ui/Button';
import AuthLayout from '../../src/features/auth/components/AuthLayout';
import GoogleSignInButton from '../../src/features/auth/components/GoogleSignInButton';
import { useAuth } from '../../src/context/AuthContext';
import { getErrorMessage } from '../../src/lib/errors';
import { loginSchema, type LoginFormValues } from '../../src/features/auth/schemas';
import { fonts, spacing, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep your streak going."
      footer={
        <>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Link href="/(auth)/register" style={styles.link}>
            Sign up
          </Link>
        </>
      }
    >
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

      <View style={styles.forgotRow}>
        <Link href="/(auth)/forgot-password" style={styles.link}>
          Forgot password?
        </Link>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button onPress={handleSubmit(onSubmit)} loading={isPending}>
        Log In
      </Button>

      <GoogleSignInButton label="Sign in with Google" onError={setError} />
    </AuthLayout>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    error: { color: colors.danger, fontSize: 13, fontFamily: fonts.regular, marginBottom: spacing.md, textAlign: 'center' },
    link: { color: colors.primaryLight, fontSize: 14, fontFamily: fonts.semibold },
    forgotRow: { alignItems: 'flex-end', marginBottom: spacing.md, marginTop: -spacing.xs },
    footerText: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.regular },
  });
}
