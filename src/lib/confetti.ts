import confetti from 'canvas-confetti';

/** Fired on rank-up or achievement unlock — a brand-colored burst from center. */
export function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#7c3aed', '#a78bfa', '#22d3ee', '#f472b6'],
  });
}
