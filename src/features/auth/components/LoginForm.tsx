import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import TextField from '../../../components/ui/TextField';
import Checkbox from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { getErrorMessage } from '../../../lib/errors';
import { loginSchema, type LoginFormValues } from '../schemas';
import { useLogin } from '../hooks/useLogin';
import GoogleSignInButton from './GoogleSignInButton';

export default function LoginForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });
  const { mutate, isPending, error } = useLogin();

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
            placeholder="••••••••"
          />
        )}
      />

      <div className="flex items-center justify-between">
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <Checkbox label="Remember me" checked={field.value} onChange={field.onChange} />
          )}
        />
        <Link to={ROUTES.forgotPassword} className="text-xs text-brand-primary-light hover:text-white">
          Forgot password?
        </Link>
      </div>

      {error && <p className="text-sm text-red-400 light:text-red-700">{getErrorMessage(error)}</p>}

      <Button type="submit" variant="primary" fullWidth loading={isPending}>
        Log In
      </Button>

      <GoogleSignInButton text="signin_with" />

      <p className="text-center text-sm text-brand-text-secondary">
        Don't have an account?{' '}
        <Link to={ROUTES.register} className="text-brand-primary-light hover:text-white">
          Sign up
        </Link>
      </p>
    </form>
  );
}
