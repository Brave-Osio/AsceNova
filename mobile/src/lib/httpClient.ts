import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { emitAuthLogout } from './authEvents';

const REFRESH_TOKEN_KEY = 'ascenova_refresh_token';

/**
 * Access token lives in memory only, same posture as the web app. The
 * refresh token can't ride an httpOnly cookie on a native app (no
 * persistent cookie jar across app restarts), so it's stored explicitly
 * via SecureStore (encrypted at-rest) and sent as a body field instead —
 * see server/src/controllers/auth.controller.ts's cookie-or-body fallback.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function setStoredRefreshToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const httpClient = axios.create({ baseURL: API_BASE_URL });

httpClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

const REFRESH_PATH = '/api/auth/refresh';

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) return null;
      try {
        const res = await axios.post<{ accessToken: string; refreshToken: string }>(
          REFRESH_PATH,
          { refreshToken },
          { baseURL: API_BASE_URL },
        );
        await setStoredRefreshToken(res.data.refreshToken);
        return res.data.accessToken;
      } catch {
        await setStoredRefreshToken(null);
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isRefreshCall = config?.url?.includes(REFRESH_PATH);

    if (error.response?.status !== 401 || !config || config._retried || isRefreshCall) {
      return Promise.reject(error);
    }

    config._retried = true;
    const newToken = await refreshAccessToken();

    if (!newToken) {
      setAccessToken(null);
      emitAuthLogout();
      return Promise.reject(error);
    }

    setAccessToken(newToken);
    config.headers.Authorization = `Bearer ${newToken}`;
    return httpClient(config);
  },
);
