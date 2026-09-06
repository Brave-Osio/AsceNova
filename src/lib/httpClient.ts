import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { emitAuthLogout } from './authEvents';

/**
 * Access token lives in memory only — never localStorage/sessionStorage,
 * to keep the migration away from persistent-token XSS exposure. It is
 * lost on hard refresh by design; AuthProvider re-hydrates it via a
 * silent POST /api/auth/refresh on boot (the refresh token itself
 * travels only as an httpOnly cookie set by the backend).
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

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
    refreshPromise = axios
      .post<{ accessToken: string }>(
        REFRESH_PATH,
        {},
        { baseURL: import.meta.env.VITE_API_BASE_URL, withCredentials: true },
      )
      .then((res) => res.data.accessToken)
      .catch(() => null)
      .finally(() => {
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
