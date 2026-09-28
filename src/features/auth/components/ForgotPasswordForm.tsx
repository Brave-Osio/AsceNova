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
    defaultValues: { email: '' },
  });
  const { mutate, isPending, error, data } = useForgotPassword();

  if (data) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-brand-text-secondary">{data.message}</p>
        {data.devResetToken && (
          <div className="rounded-lg bg-amber-500/10 p-3 text-left text-xs text-amber-300">
            <p className="font-semibold">Dev mode only — no email service is wired up yet:</p>
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
            label="Email"
            type="email"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
            placeholder="you@example.com"
          />
        )}
      />

      {error && <p className="text-sm text-red-400">{getErrorMessage(error)}</p>}

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
