/**
 * Mirrors the web app's flat design tokens (src/index.css on the web) —
 * React Native has no CSS cascade/custom properties, so this is the RN
 * equivalent single source of truth for colors, consumed via
 * `useAppTheme().colors` (see ../context/ThemeContext.tsx) and built into
 * StyleSheet objects per-component with `createStyles(colors)` + useMemo.
 */
export interface ColorPalette {
  bg: string;
  /** Chrome surfaces — tab bar, headers. */
  surface: string;
  /** Card backgrounds. */
  surfaceAlt: string;
  border: string;
  primary: string;
  primaryLight: string;
  /** Translucent primary fill for selected/badge states (e.g. picked option pill). */
  primaryMuted: string;
  /** Chip/badge backgrounds paired with dark text — stays light in both themes. */
  accent: string;
  /** Accent used as plain text/icon color on the page background — needs to
   * darken in light mode, since the light-lime `accent` value would be
   * unreadable on a white background. */
  accentInk: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
  success: string;
}

export const darkColors: ColorPalette = {
  bg: '#0e0b16',
  surface: '#17131f',
  surfaceAlt: '#1e1929',
  border: 'rgba(255,255,255,0.08)',
  primary: '#7c5cfc',
  primaryLight: '#8f73ff',
  primaryMuted: 'rgba(124,92,252,0.15)',
  accent: '#d6f84c',
  accentInk: '#d6f84c',
  textPrimary: '#f5f3fa',
  textSecondary: '#9c97ae',
  textMuted: '#6b6680',
  danger: '#f87171',
  success: '#34d399',
};

export const lightColors: ColorPalette = {
  bg: '#f6f4fb',
  surface: '#ffffff',
  surfaceAlt: '#ffffff',
  border: 'rgba(23,19,31,0.1)',
  primary: '#7c5cfc',
  primaryLight: '#6942e8',
  primaryMuted: 'rgba(124,92,252,0.12)',
  accent: '#d6f84c',
  accentInk: '#4d7c0f',
  textPrimary: '#17131f',
  textSecondary: '#5b5568',
  textMuted: '#8a8499',
  danger: '#dc2626',
  success: '#15803d',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
};
