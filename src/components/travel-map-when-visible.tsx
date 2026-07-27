import * as React from "react"
import * as styles from "./travel-map.module.css"
import { prefetchTravelGeo } from "./travel-map-geo"

const TravelMap = React.lazy(() => import("./travel-map"))

const ROOT_MARGIN = "200px"

/**
 * Defers the travel-map lazy chunk until `#travel-map` (or this sentinel) is near the viewport.
 */
const TravelMapWhenVisible = () => {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = React.useState(false)

  React.useEffect(() => {
    if (shouldLoad) return
    const node = sentinelRef.current
    if (!node || typeof IntersectionObserver === "undefined") {
      // Fire-and-forget: TravelMap attaches its own .catch when mounted.
      void prefetchTravelGeo().catch(() => {})
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void prefetchTravelGeo().catch(() => {})
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: ROOT_MARGIN },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldLoad])

  return (
    <div ref={sentinelRef}>
      {shouldLoad ? (
        <React.Suspense
          fallback={<div className={styles.slot} aria-hidden="true" />}
        >
          <TravelMap />
        </React.Suspense>
      ) : (
        <div className={styles.slot} aria-hidden="true" />
      )}
    </div>
  )
}

export default TravelMapWhenVisible
