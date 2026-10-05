import { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../lib/errors';
import { recoveryEmailSchema, type RecoveryEmailFormValues } from '../schemas';
import { useRecoveryEmail } from '../hooks/useRecoveryEmail';
import { fonts, spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

const DEFAULT_VALUES: RecoveryEmailFormValues = { recoveryEmail: '', currentPassword: '' };

/** Mirrors the web app's RecoveryEmailForm.tsx. */
export default function RecoveryEmailForm() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecoveryEmailFormValues>({ resolver: zodResolver(recoveryEmailSchema), defaultValues: DEFAULT_VALUES });
  const { maskedEmail, isLoading, save } = useRecoveryEmail();

  // Google-only accounts have no password to recover, so there is nothing to set up.
  if (user?.hasPassword === false) {
    return <Text style={styles.note}>Your account signs in with Google, so it doesn&apos;t need a recovery Gmail.</Text>;
  }

  function onSubmit(values: RecoveryEmailFormValues) {
    save.mutate(values, { onSuccess: () => reset(DEFAULT_VALUES) });
  }

  return (
    <>
      <Text style={styles.note}>
        If you forget your password, we send the reset link to this Gmail. It isn&apos;t verified — double-check it&apos;s
        yours.
      </Text>
      <Text style={styles.current}>
        Current: <Text style={styles.currentValue}>{isLoading ? 'Loading…' : (maskedEmail ?? 'None saved yet')}</Text>
      </Text>

      <Controller
        name="recoveryEmail"
        control={control}
        render={({ field }) => (
          <TextField
            label={maskedEmail ? 'New Gmail' : 'Gmail'}
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="email-address"
            autoCorrect={false}
            placeholder="you@gmail.com"
            error={errors.recoveryEmail?.message}
          />
        )}
      />
      <Controller
        name="currentPassword"
        control={control}
        render={({ field }) => (
          <TextField
            label="Current Password"
            value={field.value}
            onChangeText={field.onChange}
            secureTextEntry
            placeholder="••••••••"
            helperText={errors.currentPassword ? undefined : 'Confirms it is really you making this change'}
            error={errors.currentPassword?.message}
          />
        )}
      />

      {save.error && <Text style={styles.error}>{getErrorMessage(save.error)}</Text>}

      <Button variant="secondary" onPress={handleSubmit(onSubmit)} loading={save.isPending}>
        {maskedEmail ? 'Update Gmail' : 'Save Gmail'}
      </Button>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    note: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19, marginBottom: spacing.md },
    current: { color: colors.textMuted, fontSize: 14, fontFamily: fonts.regular, marginBottom: spacing.md },
    currentValue: { color: colors.textPrimary, fontFamily: fonts.semibold },
    error: { color: colors.danger, fontSize: 13, fontFamily: fonts.regular, marginBottom: spacing.md, textAlign: 'center' },
  });
}
