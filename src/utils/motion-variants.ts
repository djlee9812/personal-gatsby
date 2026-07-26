import type { Variants } from "framer-motion"

/** Shared fade-up used by home, projects, and blog listings. */
export function fadeInUp(options?: {
  y?: number
  duration?: number
}): Variants {
  const y = options?.y ?? 24
  const duration = options?.duration ?? 0.4
  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: "easeOut" },
    },
  }
}

/** Parent stagger for `visible` / `hidden` children. */
export function staggerContainer(staggerChildren = 0.1): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren },
    },
  }
}

/**
 * Blog index uses `show` instead of `visible` (legacy animate target).
 * Keep that naming so existing `animate="show"` call sites stay stable.
 */
export const blogListContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

export const blogListItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}
