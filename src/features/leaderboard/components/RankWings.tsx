interface RankWingsProps {
  /** Overall leaderboard position (1-based). Only 1 to 3 render anything. */
  position: number;
}

interface WingSpec {
  /** Rendered width in px; height follows the 40:32 viewBox. */
  width: number;
  /** Gradient stops (light to dark), tuned for both themes. */
  light: string;
  dark: string;
  /** How many feather layers to draw: richer for higher ranks. */
  feathers: 1 | 2 | 3;
  glow: boolean;
}

const WING_SPEC: Record<number, WingSpec> = {
  1: { width: 30, light: '#fde68a', dark: '#d97706', feathers: 3, glow: true },
  2: { width: 25, light: '#e2e8f0', dark: '#64748b', feathers: 2, glow: false },
  3: { width: 20, light: '#fdba74', dark: '#c2410c', feathers: 1, glow: false },
};

// Feather outlines for a left wing; root is at the right edge (x=40) next to the badge.
const FEATHER_PATHS = [
  'M40 14 C31 12 20 8 7 1 C9 7 13 12 19 14.5 C26 16.5 33 16 40 16 Z',
  'M40 16.5 C32 17 22 17 9 15 C11 20 16 23 23 23 C30 23 36 21 40 19 Z',
  'M40 19 C33 21 26 25 16 26 C19 29.5 24 31 29 30 C34 29 38 25 40 21 Z',
];

function Wing({ position, flip }: { position: number; flip?: boolean }) {
  const spec = WING_SPEC[position];
  const id = `wing-${position}-${flip ? 'r' : 'l'}`;
  return (
    <svg
      viewBox="0 0 40 32"
      width={spec.width}
      height={(spec.width * 32) / 40}
      aria-hidden="true"
      focusable="false"
      className={`flex-shrink-0 ${flip ? '-scale-x-100' : ''}`}
      style={spec.glow ? { filter: `drop-shadow(0 0 4px ${spec.light}99)` } : undefined}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={spec.light} />
          <stop offset="1" stopColor={spec.dark} />
        </linearGradient>
      </defs>
      {FEATHER_PATHS.slice(0, spec.feathers).map((d, i) => (
        <path key={i} d={d} fill={`url(#${id})`} opacity={1 - i * 0.18} />
      ))}
    </svg>
  );
}

/**
 * Decorative wings flanking the position badge for ranks 1 to 3. Wing size
 * and feather count shrink with rank (first place is the largest and most
 * elaborate). Purely visual: aria-hidden, no layout impact beyond the badge.
 */
export default function RankWings({ position }: RankWingsProps) {
  if (!WING_SPEC[position]) return null;
  return (
    <>
      <span className="pointer-events-none absolute right-[calc(50%+9px)] top-1/2 -translate-y-1/2">
        <Wing position={position} />
      </span>
      <span className="pointer-events-none absolute left-[calc(50%+9px)] top-1/2 -translate-y-1/2">
        <Wing position={position} flip />
      </span>
    </>
  );
}
