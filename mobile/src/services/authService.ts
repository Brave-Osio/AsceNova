import { httpClient, getStoredRefreshToken, setStoredRefreshToken } from '../lib/httpClient';

export interface AuthUser {
  id: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  status?: string;
  createdAt?: string;
  /** False for accounts created through Google sign-in that have no password. */
  hasPassword?: boolean;
  /** Masked recovery Gmail (e.g. "b***@gmail.com") from /me; null when none is saved. */
  recoveryEmailMasked?: string | null;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Thin wrapper over the auth API, mirroring the web app's
 * src/services/authService.ts — same endpoints, same shapes, adapted
 * only where the token-transport mechanism has to differ (see httpClient.ts).
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

export async function loginRequest(input: { email: string; password: string }): Promise<AuthResponse> {
  const res = await httpClient.post<AuthResponse>('/api/auth/login', { ...input, rememberMe: true });
  return res.data;
}

export async function refreshRequest(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) return null;
  const res = await httpClient.post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
    refreshToken,
  });
  return res.data;
}

export async function logoutRequest(): Promise<void> {
  const refreshToken = await getStoredRefreshToken();
  await httpClient.post('/api/auth/logout', { refreshToken });
}

export async function meRequest(): Promise<{ user: AuthUser }> {
  const res = await httpClient.get<{ user: AuthUser }>('/api/auth/me');
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

export async function setRecoveryEmailRequest(input: {
  currentPassword: string;
  recoveryEmail: string;
}): Promise<{ recoveryEmailMasked: string }> {
  const res = await httpClient.put<{ recoveryEmailMasked: string }>('/api/auth/recovery-email', input);
  return res.data;
}

export async function changePasswordRequest(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const res = await httpClient.post<{ message: string }>('/api/auth/change-password', input);
  return res.data;
}

export { setStoredRefreshToken };
