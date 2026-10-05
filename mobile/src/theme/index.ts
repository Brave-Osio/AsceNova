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
  /** Web `card-alt`: chips, progress-bar tracks, pressed/hover fills. */
  cardAlt: string;
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
  cardAlt: '#241e33',
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
  cardAlt: '#efecf7',
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

/** Matches the web's rounding: inputs/nav rows 12 (rounded-xl), cards 16 (rounded-2xl), hero/auth cards 24 (rounded-3xl), buttons/chips full. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/**
 * Plus Jakarta Sans, same family as the web. React Native picks the weight
 * from the font family name (not `fontWeight`), so always use these.
 * Loaded in app/_layout.tsx.
 */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const typography = {
  /** Web page title: text-2xl font-extrabold. */
  h1: { fontSize: 24, fontFamily: fonts.extrabold },
  h2: { fontSize: 18, fontFamily: fonts.bold },
  body: { fontSize: 15, fontFamily: fonts.regular },
  subtitle: { fontSize: 14, fontFamily: fonts.regular },
  /** Web section label: text-xs font-bold uppercase tracking-widest. */
  label: { fontSize: 11, fontFamily: fonts.bold, textTransform: 'uppercase' as const, letterSpacing: 1.4 },
};
