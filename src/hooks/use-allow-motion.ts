import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"

/**
 * Derive framer-motion `initial` from hydrate + reduced-motion preference.
 *
 * `useReducedMotion()` is `null` during SSR (no `window.matchMedia`). Treating
 * that as "motion OK" makes `initial="hidden"` / `{ opacity: 0 }` ship in HTML,
 * so no-JS and pre-hydrate content stay invisible.
 */
export function motionEnterInitial(
  hydrated: boolean,
  prefersReducedMotion: boolean | null
): false | "hidden" {
  return hydrated && prefersReducedMotion === false ? "hidden" : false
}

/**
 * SSR-safe motion gate. Keep motion off until after hydrate; only then use
 * `"hidden"` enter states that animate via `whileInView` / `animate`.
 */
export function useAllowMotion() {
  const prefersReducedMotion = useReducedMotion()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const allowMotion = hydrated && prefersReducedMotion === false
  const enterInitial = motionEnterInitial(hydrated, prefersReducedMotion)

  return { prefersReducedMotion, allowMotion, enterInitial }
}
