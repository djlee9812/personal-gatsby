/**
 * Kept separate so the homepage can size the Suspense fallback without importing the map chunk.
 * ComposableMap viewBox uses WIDTH × HEIGHT; placeholders/wrap use the same aspect ratio to avoid CLS.
 */
export const TRAVEL_MAP_WIDTH = 800
export const TRAVEL_MAP_HEIGHT = 500

/** CSS `aspect-ratio` value matching the SVG viewBox. */
export const TRAVEL_MAP_ASPECT_RATIO = `${TRAVEL_MAP_WIDTH} / ${TRAVEL_MAP_HEIGHT}`
