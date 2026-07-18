/**
 * TransitOps Enterprise Animation Presets
 * Standardized Framer Motion variants for consistent UI motion.
 */

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

export const SLIDE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

export const SCALE_UP = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const PAGE_TRANSITION = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: 0.4, ease: 'easeInOut' }
};

export const STAGGER_CONTAINER = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const HOVER_EFFECTS = {
  card: {
    whileHover: { y: -4, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 }
  },
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.95 }
  },
  icon: {
    whileHover: { scale: 1.1, rotate: 5 },
    whileTap: { scale: 0.9 }
  }
};
