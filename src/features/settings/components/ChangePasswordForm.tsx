import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routes';
import { getErrorMessage } from '../../../lib/errors';
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas';
import { useChangePassword } from '../hooks/useChangePassword';

const DEFAULT_VALUES: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ChangePasswordForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { mutate, isPending, error } = useChangePassword();
  const { user } = useAuth();

  // Google-only accounts have no current password to change; "Forgot password" lets them set one.
  if (user?.hasPassword === false) {
    return (
      <p className="text-sm text-brand-text-secondary">
        Your account signs in with Google and has no password yet. To also sign in with email and password, use{' '}
        <Link to={ROUTES.forgotPassword} className="text-brand-primary-light hover:text-white">
          Forgot password
        </Link>{' '}
        to set one.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => mutate(values, { onSuccess: () => reset(DEFAULT_VALUES) }))}
      className="space-y-4"
    >
      <Controller
        name="currentPassword"
        control={control}
        render={({ field }) => (
          <TextField
            label="Current Password"
            type="password"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.currentPassword?.message}
            placeholder="••••••••"
          />
        )}
      />

      <Controller
        name="newPassword"
        control={control}
        render={({ field }) => (
          <TextField
            label="New Password"
            type="password"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.newPassword?.message}
            helperText={errors.newPassword ? undefined : 'At least 8 characters'}
            placeholder="••••••••"
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            label="Confirm New Password"
            type="password"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.confirmPassword?.message}
            placeholder="••••••••"
          />
        )}
      />

      {error && <p className="text-sm text-red-400 light:text-red-700">{getErrorMessage(error)}</p>}

      <Button type="submit" variant="secondary" loading={isPending}>
        Change Password
      </Button>
    </form>
  );
}
