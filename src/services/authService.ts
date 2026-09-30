import { httpClient } from '../lib/httpClient';

export interface AuthUser {
  id: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  status?: string;
  createdAt?: string;
  /** False for accounts created through Google sign-in that haven't set a password yet. */
  hasPassword?: boolean;
  /** Masked recovery Gmail (e.g. "b***@gmail.com") from /me; null when none is saved. */
  recoveryEmailMasked?: string | null;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

/**
 * Thin wrapper over the auth API endpoints — mirrors the "one exported
 * function per concern" convention already used by planService.ts
 * and coachService.ts. AuthContext is the only intended caller.
 */
export async function registerRequest(input: {
  email: string;
  password: string;
  fullName: string;
  recoveryEmail?: string;
}): Promise<AuthResponse> {
  const res = await httpClient.post<AuthResponse>('/api/auth/register', input);
  return res.data;
}

export async function loginRequest(input: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<AuthResponse> {
  const res = await httpClient.post<AuthResponse>('/api/auth/login', input);
  return res.data;
}

export async function googleLoginRequest(input: {
  idToken: string;
  rememberMe: boolean;
}): Promise<GoogleAuthResponse> {
  const res = await httpClient.post<GoogleAuthResponse>('/api/auth/google', input);
  return res.data;
}

export async function refreshRequest(): Promise<{ accessToken: string }> {
  const res = await httpClient.post<{ accessToken: string }>('/api/auth/refresh');
  return res.data;
}

export async function logoutRequest(): Promise<void> {
  await httpClient.post('/api/auth/logout');
}

export async function meRequest(): Promise<{ user: AuthUser }> {
  const res = await httpClient.get<{ user: AuthUser }>('/api/auth/me');
  return res.data;
}

export async function setRecoveryEmailRequest(input: {
  currentPassword: string;
  recoveryEmail: string;
}): Promise<{ recoveryEmailMasked: string }> {
  const res = await httpClient.put<{ recoveryEmailMasked: string }>('/api/auth/recovery-email', input);
  return res.data;
}

/** `email` is the account's username; `recoveryEmail` must match the Gmail saved in Settings. */
export async function forgotPasswordRequest(input: {
  email: string;
  recoveryEmail: string;
}): Promise<{ message: string; devResetToken?: string }> {
  const res = await httpClient.post<{ message: string; devResetToken?: string }>(
    '/api/auth/forgot-password',
    input,
  );
  return res.data;
}

export async function resetPasswordRequest(input: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const res = await httpClient.post<{ message: string }>('/api/auth/reset-password', input);
  return res.data;
}

export async function changePasswordRequest(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const res = await httpClient.post<{ message: string }>('/api/auth/change-password', input);
  return res.data;
}
