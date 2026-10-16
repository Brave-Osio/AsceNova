import type { Variants } from 'framer-motion';

/**
 * Shared motion tokens so every animated surface uses the same timing.
 * Reduced-motion is handled globally by <MotionConfig reducedMotion="user">
 * in AppProviders (framer-motion drops transforms) plus a CSS media query in
 * index.css (CSS transitions/animations).
 */
export const MOTION_DURATION = { fast: 0.15, base: 0.25, slow: 0.4 } as const;
export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: MOTION_DURATION.slow, ease: MOTION_EASE } },
};

export const listContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: MOTION_DURATION.fast } },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: MOTION_DURATION.base } },
  exit: { opacity: 0, transition: { duration: MOTION_DURATION.fast } },
};

export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: MOTION_DURATION.fast } },
};
