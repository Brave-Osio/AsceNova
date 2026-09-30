import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const recoveryEmailSchema = z.object({
  recoveryEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Gmail address is required')
    .regex(/^[^\s@]+@gmail\.com$/, 'Enter a Gmail address (name@gmail.com)'),
  currentPassword: z.string().min(1, 'Enter your current password to confirm'),
});
export type RecoveryEmailFormValues = z.infer<typeof recoveryEmailSchema>;
