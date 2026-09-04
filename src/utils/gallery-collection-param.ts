/** Query param that selects a gallery collection by title slug. */
export const GALLERY_COLLECTION_PARAM = "c"

/** Lowercased, trimmed collection title used as `?c=` value. */
export function collectionSlug(title: string): string {
  return title.trim().toLowerCase()
}

/**
 * Index of the collection named by `?c=` (case-insensitive).
 * Missing, empty, or unknown values return 0 (first collection).
 */
export function collectionIndexFromSearch(
  search: string,
  collections: ReadonlyArray<{ title: string }>,
): number {
  if (collections.length === 0) return 0
  const raw = new URLSearchParams(search).get(GALLERY_COLLECTION_PARAM)
  if (!raw) return 0
  const wanted = collectionSlug(raw)
  if (!wanted) return 0
  const index = collections.findIndex(
    (collection) => collectionSlug(collection.title) === wanted,
  )
  return index >= 0 ? index : 0
}
