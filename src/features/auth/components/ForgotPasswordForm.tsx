import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { getErrorMessage } from '../../../lib/errors';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas';
import { useForgotPassword } from '../hooks/useForgotPassword';

export default function ForgotPasswordForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '', recoveryEmail: '' },
  });
  const { mutate, isPending, error, data } = useForgotPassword();

  if (data) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-brand-text-secondary">{data.message}</p>
        {data.devResetToken && (
          <div className="rounded-lg bg-amber-500/10 p-3 text-left text-xs text-amber-300 light:text-amber-700">
            <p className="font-semibold">Dev mode only — email isn't configured, so the reset link is shown here instead:</p>
            <Link
              to={`${ROUTES.resetPassword}?token=${data.devResetToken}`}
              className="mt-1 block break-all underline"
            >
              {ROUTES.resetPassword}?token={data.devResetToken}
            </Link>
          </div>
        )}
        <Link to={ROUTES.login} className="inline-block text-sm text-brand-primary-light hover:text-white">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))} className="space-y-4">
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            label="Username"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
            placeholder="Your username"
          />
        )}
      />

      <Controller
        name="recoveryEmail"
        control={control}
        render={({ field }) => (
          <TextField
            label="Gmail on your account"
            type="email"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.recoveryEmail?.message}
            helperText={errors.recoveryEmail ? undefined : 'The Gmail you saved in Settings'}
            placeholder="you@gmail.com"
          />
        )}
      />

      {error && <p className="text-sm text-red-400 light:text-red-700">{getErrorMessage(error)}</p>}

      <p className="text-xs text-brand-text-muted">
        No Gmail saved on your account, or signed up with Google? Reset links can't be sent for those — Google sign-in
        users can use Continue with Google instead.
      </p>

      <Button type="submit" variant="primary" fullWidth loading={isPending}>
        Send Reset Link
      </Button>

      <p className="text-center text-sm text-brand-text-secondary">
        <Link to={ROUTES.login} className="text-brand-primary-light hover:text-white">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
