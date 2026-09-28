import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { getErrorMessage } from '../../../lib/errors';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas';
import { useResetPassword } from '../hooks/useResetPassword';

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenFromUrl, newPassword: '', confirmPassword: '' },
  });
  const { mutate, isPending, error } = useResetPassword();

  if (!tokenFromUrl) {
    return (
      <div className="space-y-4 text-center text-sm text-brand-text-secondary">
        <p>This reset link is missing its token. Request a new one below.</p>
        <Link to={ROUTES.forgotPassword} className="text-brand-primary-light hover:text-white">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))} className="space-y-4">
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

      {error && <p className="text-sm text-red-400">{getErrorMessage(error)}</p>}

      <Button type="submit" variant="primary" fullWidth loading={isPending}>
        Reset Password
      </Button>
    </form>
  );
}
