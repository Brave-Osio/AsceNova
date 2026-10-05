import { z } from 'zod';

// The `email` field is the account's login name — the API keeps that name for backward
// compatibility, but the UI calls it "Username". Login stays lenient so accounts created
// before usernames existed (whose username is their old email) can still sign in.
export const USERNAME_PATTERN = /^[a-z0-9._@+-]+$/;
export const GMAIL_PATTERN = /^[^\s@]+@gmail\.com$/;

const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(254, 'Username is too long')
  .regex(USERNAME_PATTERN, 'Use only letters, numbers and . _ @ + -');

const gmailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Gmail address is required')
  .regex(GMAIL_PATTERN, 'Enter a Gmail address (name@gmail.com)');

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    email: usernameField,
    // Optional: blank is allowed, anything else must be a Gmail address.
    recoveryEmail: z
      .string()
      .trim()
      .toLowerCase()
      .refine((v) => v === '' || GMAIL_PATTERN.test(v), 'Enter a Gmail address (name@gmail.com)'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptedTerms: z.boolean().refine((v) => v, 'You must accept the Terms and Conditions to continue'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Username is required'),
  recoveryEmail: gmailField,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
