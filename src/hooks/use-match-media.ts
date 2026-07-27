import { useEffect, useState } from "react"

/**
 * SSR-safe matchMedia subscription. Always starts `false` so server HTML and
 * the first client paint match; updates after mount.
 */
export function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const sync = () => setMatches(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [query])

  return matches
}
