import type { Variants } from "framer-motion"

/**
 * Homepage motion budget (editorial / calm):
 * - Hero: plane establishes scene; title static; subtitle delayed fade
 * - About: asymmetric briefing (title → text → portrait)
 * - Hobbies: overlay labels only (no card translate vs CSS hover)
 * - Travel: copy fade only; map shell static
 * Do not reuse one fadeInUp+stagger for every homepage section.
 */

/** Shared fade-up used by projects and blog listings (not homepage sections). */
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

/** About: orchestrate title → text → portrait. */
export const aboutBriefingContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.04 },
  },
}

export const aboutTextReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
}

export const aboutPortraitLand: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

/** Soft opacity for lower-section titles / Travel copy / About title. */
export const softInView: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export const aboutTitleFade = softInView

/** Hobbies: motion on caption overlays only. */
export function hobbyOverlayFade(delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.4, ease: "easeOut" },
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
