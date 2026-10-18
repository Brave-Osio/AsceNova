import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface WingSpec {
  /** Rendered width in px; height follows the 40:32 viewBox. */
  width: number;
  light: string;
  dark: string;
  /** How many feather layers to draw: richer for higher ranks. */
  feathers: 1 | 2 | 3;
}

const WING_SPEC: Record<number, WingSpec> = {
  1: { width: 26, light: '#fde68a', dark: '#d97706', feathers: 3 },
  2: { width: 22, light: '#e2e8f0', dark: '#64748b', feathers: 2 },
  3: { width: 18, light: '#fdba74', dark: '#c2410c', feathers: 1 },
};

// Feather outlines for a left wing; root is at the right edge (x=40) next to the badge. Same paths as the web.
const FEATHER_PATHS = [
  'M40 14 C31 12 20 8 7 1 C9 7 13 12 19 14.5 C26 16.5 33 16 40 16 Z',
  'M40 16.5 C32 17 22 17 9 15 C11 20 16 23 23 23 C30 23 36 21 40 19 Z',
  'M40 19 C33 21 26 25 16 26 C19 29.5 24 31 29 30 C34 29 38 25 40 21 Z',
];

function Wing({ position, flip }: { position: number; flip?: boolean }) {
  const spec = WING_SPEC[position];
  const id = `wing-${position}-${flip ? 'r' : 'l'}`;
  return (
    <Svg
      viewBox="0 0 40 32"
      width={spec.width}
      height={(spec.width * 32) / 40}
      style={flip ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={spec.light} />
          <Stop offset="1" stopColor={spec.dark} />
        </LinearGradient>
      </Defs>
      {FEATHER_PATHS.slice(0, spec.feathers).map((d, i) => (
        <Path key={i} d={d} fill={`url(#${id})`} opacity={1 - i * 0.18} />
      ))}
    </Svg>
  );
}

/**
 * Mirrors the web's RankWings: decorative wings flanking the position badge for ranks 1 to 3, shrinking
 * with rank. Purely visual; the parent must be position-relative and centred on the badge.
 */
export default function RankWings({ position }: { position: number }) {
  if (!WING_SPEC[position]) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={styles.left}>
        <Wing position={position} />
      </View>
      <View style={styles.right}>
        <Wing position={position} flip />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  left: { position: 'absolute', right: '50%', marginRight: 9 },
  right: { position: 'absolute', left: '50%', marginLeft: 9 },
});
