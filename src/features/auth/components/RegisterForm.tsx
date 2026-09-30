import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { getErrorMessage } from '../../../lib/errors';
import { registerSchema, type RegisterFormValues } from '../schemas';
import { useRegister } from '../hooks/useRegister';
import GoogleSignInButton from './GoogleSignInButton';

export default function RegisterForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', recoveryEmail: '', password: '', confirmPassword: '' },
  });
  const { mutate, isPending, error } = useRegister();

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))} className="space-y-4">
      <Controller
        name="fullName"
        control={control}
        render={({ field }) => (
          <TextField
            label="Full Name"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.fullName?.message}
            placeholder="Juan Dela Cruz"
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
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
            helperText={errors.email ? undefined : 'You will log in with this'}
            placeholder="juandelacruz"
          />
        )}
      />

      <Controller
        name="recoveryEmail"
        control={control}
        render={({ field }) => (
          <TextField
            label="Gmail (optional)"
            type="email"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.recoveryEmail?.message}
            helperText={
              errors.recoveryEmail ? undefined : 'Used only to send a password reset link — you can add it later in Settings'
            }
            placeholder="you@gmail.com"
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            label="Password"
            type="password"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
            helperText={errors.password ? undefined : 'At least 8 characters'}
            placeholder="••••••••"
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            label="Confirm Password"
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

      <Button type="submit" variant="primary" fullWidth loading={isPending}>
        Create Account
      </Button>

      <GoogleSignInButton text="signup_with" />

      <p className="text-center text-sm text-brand-text-secondary">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="text-brand-primary-light hover:text-white">
          Log in
        </Link>
      </p>
    </form>
  );
}
