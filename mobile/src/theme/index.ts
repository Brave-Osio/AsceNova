/**
 * Mirrors the web app's dark violet/cyan design tokens (src/index.css on
 * the web) — React Native has no Tailwind, so this is the RN equivalent
 * single source of truth for colors/spacing, consumed via StyleSheet.
 */
export const colors = {
  bg: '#0a0a0f',
  surface: '#151520',
  surfaceAlt: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  violet: '#7c3aed',
  violetLight: '#a78bfa',
  cyan: '#22d3ee',
  pink: '#f472b6',
  textPrimary: '#f5f5f7',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  danger: '#f87171',
  success: '#34d399',
} as const;

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
