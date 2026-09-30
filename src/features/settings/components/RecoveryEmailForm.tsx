import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../lib/errors';
import { recoveryEmailSchema, type RecoveryEmailFormValues } from '../schemas';
import { useRecoveryEmail } from '../hooks/useRecoveryEmail';

const DEFAULT_VALUES: RecoveryEmailFormValues = { recoveryEmail: '', currentPassword: '' };

export default function RecoveryEmailForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecoveryEmailFormValues>({
    resolver: zodResolver(recoveryEmailSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { maskedEmail, isLoading, save } = useRecoveryEmail();
  const { user } = useAuth();

  // Google-only accounts have no password to recover, so there is nothing to set up.
  if (user?.hasPassword === false) {
    return (
      <p className="text-sm text-brand-text-secondary">
        Your account signs in with Google, so it doesn't need a recovery Gmail.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => save.mutate(values, { onSuccess: () => reset(DEFAULT_VALUES) }))}
      className="space-y-4"
    >
      <p className="text-sm text-brand-text-secondary">
        If you forget your password, we send the reset link to this Gmail. Not verified — double-check it's yours.
      </p>

      <div className="text-sm">
        <span className="text-brand-text-muted">Current: </span>
        <span className="font-semibold text-brand-text">
          {isLoading ? 'Loading…' : (maskedEmail ?? 'None saved yet')}
        </span>
      </div>

      <Controller
        name="recoveryEmail"
        control={control}
        render={({ field }) => (
          <TextField
            label={maskedEmail ? 'New Gmail' : 'Gmail'}
            type="email"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.recoveryEmail?.message}
            placeholder="you@gmail.com"
          />
        )}
      />

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
            helperText={errors.currentPassword ? undefined : 'Confirms it is really you making this change'}
            placeholder="••••••••"
          />
        )}
      />

      {save.error && <p className="text-sm text-red-400 light:text-red-700">{getErrorMessage(save.error)}</p>}

      <Button type="submit" variant="secondary" loading={save.isPending}>
        {maskedEmail ? 'Update Gmail' : 'Save Gmail'}
      </Button>
    </form>
  );
}
