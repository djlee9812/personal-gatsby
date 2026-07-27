const WORLD_GEO_URL = "/geo/ne_50m_admin_0_map_units.json"
const STATES_GEO_URL = "/geo/states-10m.json"

let geoPromise: Promise<{ world: object; states: object }> | null = null

async function loadGeography(url: string): Promise<object> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`)
  return res.json()
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
