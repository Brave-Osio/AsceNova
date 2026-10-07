import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  googleLoginRequest,
  refreshRequest,
  meRequest,
  setStoredRefreshToken,
  type AuthUser,
} from '../services/authService';
import { setAccessToken } from '../lib/httpClient';
import { onAuthLogout } from '../lib/authEvents';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { email: string; password: string; fullName: string; recoveryEmail?: string }) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Mirrors the web app's src/context/AuthContext.tsx — same shape, same
 * startup-hydration idea (silent refresh -> /me), adapted only for the
 * SecureStore-backed refresh token instead of an httpOnly cookie.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const tokens = await refreshRequest();
        if (!tokens) throw new Error('No stored session');
        setAccessToken(tokens.accessToken);
        const { user: me } = await meRequest();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    }

    hydrate();
    const unsubscribe = onAuthLogout(() => {
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  async function login(input: { email: string; password: string }) {
    const { user: loggedInUser, accessToken, refreshToken } = await loginRequest(input);
    setAccessToken(accessToken);
    await setStoredRefreshToken(refreshToken);
    setUser(loggedInUser);
    setStatus('authenticated');
  }

  async function register(input: { email: string; password: string; fullName: string; recoveryEmail?: string }) {
    const { user: newUser, accessToken, refreshToken } = await registerRequest(input);
    setAccessToken(accessToken);
    await setStoredRefreshToken(refreshToken);
    setUser(newUser);
    setStatus('authenticated');
  }

  async function loginWithGoogle(idToken: string) {
    const { user: googleUser, accessToken, refreshToken, isNewUser } = await googleLoginRequest(idToken);
    setAccessToken(accessToken);
    await setStoredRefreshToken(refreshToken);
    setUser(googleUser);
    setStatus('authenticated');
    return { isNewUser };
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      await setStoredRefreshToken(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  }

  const value: AuthContextValue = {
    user,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
