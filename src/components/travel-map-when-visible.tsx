import * as React from "react"
import * as styles from "./travel-map.module.css"
import { TRAVEL_MAP_ASPECT_RATIO } from "./travel-map-constants"

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
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: ROOT_MARGIN },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldLoad])

  // Inline aspect-ratio mirrors CSS so Suspense fallback works before CSS module loads.
  const slotStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: TRAVEL_MAP_ASPECT_RATIO,
    background: "transparent",
  }

  return (
    <div ref={sentinelRef}>
      {shouldLoad ? (
        <React.Suspense
          fallback={<div style={slotStyle} className={styles.slot} aria-hidden="true" />}
        >
          <TravelMap />
        </React.Suspense>
      ) : (
        <div style={slotStyle} className={styles.slot} aria-hidden="true" />
      )}
    </div>
  )
}

export default TravelMapWhenVisible
