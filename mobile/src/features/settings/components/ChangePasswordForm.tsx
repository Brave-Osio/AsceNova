import { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../lib/errors';
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas';
import { useChangePassword } from '../hooks/useChangePassword';
import { spacing, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

const DEFAULT_VALUES: ChangePasswordFormValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** Mirrors the web app's ChangePasswordForm.tsx. */
export default function ChangePasswordForm() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: DEFAULT_VALUES });
  const { mutate, isPending, error } = useChangePassword();
  const { user } = useAuth();

  function onSubmit(values: ChangePasswordFormValues) {
    mutate(values, { onSuccess: () => reset(DEFAULT_VALUES) });
  }

  // Google-only accounts have no password on our side — Google manages theirs.
  if (user?.hasPassword === false) {
    return (
      <Text style={styles.note}>
        Your account signs in with Google, so there is no AsceNova password to change. Manage your password in your
        Google account.
      </Text>
    );
  }

  return (
    <>
      <Controller name="currentPassword" control={control} render={({ field }) => (
        <TextField label="Current Password" value={field.value} onChangeText={field.onChange} secureTextEntry placeholder="••••••••" error={errors.currentPassword?.message} />
      )} />
      <Controller name="newPassword" control={control} render={({ field }) => (
        <TextField label="New Password" value={field.value} onChangeText={field.onChange} secureTextEntry placeholder="••••••••" helperText={errors.newPassword ? undefined : 'At least 8 characters'} error={errors.newPassword?.message} />
      )} />
      <Controller name="confirmPassword" control={control} render={({ field }) => (
        <TextField label="Confirm New Password" value={field.value} onChangeText={field.onChange} secureTextEntry placeholder="••••••••" error={errors.confirmPassword?.message} />
      )} />

      {error && <Text style={styles.error}>{getErrorMessage(error)}</Text>}

      <Button variant="secondary" onPress={handleSubmit(onSubmit)} loading={isPending}>
        Change Password
      </Button>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
    note: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  });
}
