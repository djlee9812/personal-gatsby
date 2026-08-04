const WORLD_GEO_URL = "/geo/ne_50m_admin_0_map_units.json"
const STATES_GEO_URL = "/geo/states-10m.json"

let geoPromise: Promise<{ world: object; states: object }> | null = null

/** Minimal TopoJSON shape check before react-simple-maps consumes the payload. */
export function assertTopojson(value: unknown, url: string): asserts value is object {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Invalid TopoJSON from ${url}: expected object`)
  }
  const objects = (value as { objects?: unknown }).objects
  if (
    typeof objects !== "object" ||
    objects === null ||
    Array.isArray(objects)
  ) {
    throw new Error(`Invalid TopoJSON from ${url}: missing objects`)
  }
}

async function loadGeography(url: string): Promise<object> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`)
  const data: unknown = await res.json()
  assertTopojson(data, url)
  return data
}

/** Start (or reuse) fetch of both geo files. Safe to call multiple times. */
export function prefetchTravelGeo() {
  if (!geoPromise) {
    geoPromise = Promise.all([
      loadGeography(WORLD_GEO_URL),
      loadGeography(STATES_GEO_URL),
    ])
      .then(([world, states]) => ({ world, states }))
      .catch((err) => {
        // Allow a later call to retry after a transient failure.
        geoPromise = null
        throw err
      })
  }
  return geoPromise
}
