import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  refreshRequest,
  meRequest,
  type AuthUser,
} from '../services/authService';
import { setAccessToken } from '../lib/httpClient';
import { onAuthLogout } from '../lib/authEvents';
import { showErrorToast, showSuccessToast } from '../lib/toast';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (input: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  register: (input: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Kept as its own context rather than folded into a React Query hook:
 * auth has a different consumer set (route guards, every HTTP call,
 * navbar) and a different lifecycle (must resolve before profile/
 * progress queries can even know which user to fetch for).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const { accessToken } = await refreshRequest();
        setAccessToken(accessToken);
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

  async function login(input: { email: string; password: string; rememberMe: boolean }) {
    const { user: loggedInUser, accessToken } = await loginRequest(input);
    setAccessToken(accessToken);
    setUser(loggedInUser);
    setStatus('authenticated');
  }

  async function register(input: { email: string; password: string; fullName: string }) {
    const { user: newUser, accessToken } = await registerRequest(input);
    setAccessToken(accessToken);
    setUser(newUser);
    setStatus('authenticated');
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch (err) {
      showErrorToast(err);
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
      showSuccessToast('Logged out');
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
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Kept with AuthProvider deliberately; splitting it out would mean updating
// ~26 import sites for an HMR nicety with no functional effect.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
