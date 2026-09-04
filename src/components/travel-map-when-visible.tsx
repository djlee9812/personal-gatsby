import * as React from "react"
import { IslandErrorBoundary } from "./island-error-boundary"
import { TRAVEL_MAP_GEO_ERROR } from "./travel-map-constants"
import * as styles from "./travel-map.module.css"
import { prefetchTravelGeo } from "./travel-map-geo"

const TravelMap = React.lazy(
  () => import(/* webpackChunkName: "travel-map" */ "./travel-map"),
)

const mapChunkFallback = (
  <div className={styles.slot} role="status">
    <p className={styles.geoError}>{TRAVEL_MAP_GEO_ERROR}</p>
  </div>
)

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
        <IslandErrorBoundary fallback={mapChunkFallback}>
          <React.Suspense
            fallback={<div className={styles.slot} aria-hidden="true" />}
          >
            <TravelMap />
          </React.Suspense>
        </IslandErrorBoundary>
      ) : (
        <div className={styles.slot} aria-hidden="true" />
      )}
    </div>
  )
}

export default TravelMapWhenVisible
