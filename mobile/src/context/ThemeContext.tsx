import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, type ColorPalette } from '../theme';

export type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'ascenova.theme';

interface ThemeContextValue {
  theme: ThemeName;
  colors: ColorPalette;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Mirrors the web app's ThemeContext: defaults to the OS light/dark setting,
 * then a manually-toggled choice (persisted via AsyncStorage) wins from then
 * on. Unlike the web version there's no way to apply the resolved theme
 * before first paint on native, so the very first frame briefly uses the OS
 * scheme (or dark, if that's unavailable) until the stored preference loads
 * — a one-frame flicker at cold start, not worth the complexity to avoid.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeName>(systemScheme === 'light' ? 'light' : 'dark');

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next: ThemeName = current === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
        // Storage unavailable — theme still applies for this session, it
        // just won't persist across app restarts.
      });
      return next;
    });
  }

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, colors: theme === 'light' ? lightColors : darkColors, toggleTheme }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return ctx;
}
