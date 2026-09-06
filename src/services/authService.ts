import { httpClient } from '../lib/httpClient';

export interface AuthUser {
  id: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  status?: string;
  createdAt?: string;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

/**
 * Thin wrapper over the auth API endpoints — mirrors the "one exported
 * function per concern" convention already used by fitnessService.ts
 * and coachService.ts. AuthContext is the only intended caller.
 */
export async function registerRequest(input: {
  email: string;
  password: string;
  fullName: string;
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

export async function forgotPasswordRequest(input: {
  email: string;
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
