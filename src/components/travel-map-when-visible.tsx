import * as React from "react"
import { TRAVEL_MAP_HEIGHT } from "./travel-map-constants"

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

  return (
    <div ref={sentinelRef}>
      {shouldLoad ? (
        <React.Suspense
          fallback={
            <div style={{ width: "100%", height: TRAVEL_MAP_HEIGHT, background: "transparent" }} aria-hidden="true" />
          }
        >
          <TravelMap />
        </React.Suspense>
      ) : (
        <div style={{ width: "100%", height: TRAVEL_MAP_HEIGHT, background: "transparent" }} aria-hidden="true" />
      )}
    </div>
  )
}

export default TravelMapWhenVisible
