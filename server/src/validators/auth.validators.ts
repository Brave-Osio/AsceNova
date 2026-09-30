import { z } from 'zod';

// The account's login name. It is stored in the `email` column (kept for backward
// compatibility — existing users log in with the email they registered with), but the UI
// calls it "Username", so any handle-like string is accepted, including `@` and `.`.
const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(254, 'Username is too long')
  .regex(/^[a-z0-9._@+-]+$/, 'Username can only use letters, numbers and . _ @ + -');

// Unverified Gmail address used only to deliver password-reset links.
const gmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid Gmail address')
  .regex(/@gmail\.com$/, 'Enter a Gmail address (name@gmail.com)');

export const registerSchema = z.object({
  email: usernameSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().trim().min(1, 'Full name is required'),
  // Optional; a blank form field arrives as '' and means "not provided".
  recoveryEmail: z.preprocess((v) => (v === '' ? undefined : v), gmailSchema.optional()),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// Login stays lenient: anyone who registered before usernames existed must still get in,
// and an unknown name just fails with the same 401 as a wrong password.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Username is required').max(254),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'Google credential is required'),
  rememberMe: z.boolean().default(false),
});
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Username is required').max(254),
  recoveryEmail: gmailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const setRecoveryEmailSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  recoveryEmail: gmailSchema,
});
export type SetRecoveryEmailInput = z.infer<typeof setRecoveryEmailSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
