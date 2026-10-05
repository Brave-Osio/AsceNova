import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { getErrorMessage } from '../../../lib/errors';
import { registerSchema, type RegisterFormValues } from '../schemas';
import { useRegister } from '../hooks/useRegister';
import GoogleSignInButton from './GoogleSignInButton';
import TermsModal from './TermsModal';

export default function RegisterForm() {
  const [termsOpen, setTermsOpen] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      recoveryEmail: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });
  const acceptedTerms = useWatch({ control, name: 'acceptedTerms' });
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

      <Controller
        name="acceptedTerms"
        control={control}
        render={({ field }) => (
          <div>
            <label className="flex items-start gap-2 text-sm text-brand-text">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-brand-border bg-brand-card text-brand-primary focus:ring-brand-primary/60"
              />
              <span>
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="text-brand-primary-light underline hover:text-brand-text focus-visible:outline-none"
                >
                  Terms and Conditions
                </button>
              </span>
            </label>
            {errors.acceptedTerms && (
              <p className="mt-1 text-sm text-red-400 light:text-red-700">{errors.acceptedTerms.message}</p>
            )}
          </div>
        )}
      />

      {error && <p className="text-sm text-red-400 light:text-red-700">{getErrorMessage(error)}</p>}

      <Button type="submit" variant="primary" fullWidth loading={isPending}>
        Create Account
      </Button>

      {/* Google sign-up also creates an account, so it stays locked until the terms are accepted. */}
      <div className={acceptedTerms ? '' : 'pointer-events-none opacity-50'} aria-disabled={!acceptedTerms}>
        <GoogleSignInButton text="signup_with" />
      </div>
      {!acceptedTerms && (
        <p className="text-center text-xs text-brand-text-secondary">Accept the terms to sign up with Google.</p>
      )}

      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />

      <p className="text-center text-sm text-brand-text-secondary">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="text-brand-primary-light hover:text-brand-text hover:underline focus-visible:text-brand-text focus-visible:underline focus-visible:outline-none active:text-brand-primary">
          Log in
        </Link>
      </p>
    </form>
  );
}
