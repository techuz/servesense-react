import type { Transition, Variants } from 'framer-motion';

/* ============================================================================
   Motion design language
   - Easing curves: refined, hospitality-feel — not too bouncy, never linear.
   - Durations: 200–600 ms range. Use longer ones sparingly for hero choreography.
   - Reduce motion: respect the user's preference (handled by framer-motion).
   ============================================================================ */

export const easing = {
  /** Decelerating out (default for most reveals) */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Smooth in-out */
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  /** Anticipatory snap */
  snap: [0.32, 0.72, 0, 1] as [number, number, number, number],
  /** Soft spring-y feel without true spring */
  soft: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export const duration = {
  fast: 0.18,
  base: 0.3,
  slow: 0.55,
  hero: 0.9,
};

/* --- Transitions ---------------------------------------------------------- */
export const transitions = {
  base: { duration: duration.base, ease: easing.out } satisfies Transition,
  fast: { duration: duration.fast, ease: easing.out } satisfies Transition,
  slow: { duration: duration.slow, ease: easing.out } satisfies Transition,
  spring: { type: 'spring' as const, stiffness: 380, damping: 30, mass: 0.8 },
  softSpring: { type: 'spring' as const, stiffness: 240, damping: 26, mass: 0.9 },
} as const;

/* --- Variants: reusable choreography ------------------------------------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: -8, transition: transitions.fast },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
  exit: { opacity: 0, transition: transitions.fast },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitions.softSpring },
  exit: { opacity: 0, scale: 0.98, transition: transitions.fast },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: transitions.base },
  exit: { opacity: 0, x: 24, transition: transitions.fast },
};

/* Container that staggers children */
export const stagger = (staggerChildren = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
  exit: {
    transition: { staggerChildren: 0.02, staggerDirection: -1 },
  },
});

/* --- Page transition (route-level) --------------------------------------- */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easing.out } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.18, ease: easing.out } },
};

/* --- Hover/tap presets for interactive elements -------------------------- */
export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.18, ease: easing.out } },
  whileTap: { y: 0, scale: 0.99, transition: { duration: 0.08 } },
};

export const hoverGlow = {
  whileHover: { scale: 1.02, transition: { duration: 0.18, ease: easing.out } },
  whileTap: { scale: 0.99 },
};
