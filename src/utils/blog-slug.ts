/**
 * Trim and reject empty / whitespace-only blog slugs so createPages and
 * listing UI agree on what is publishable.
 */
export function normalizeBlogSlug(
  slug: string | null | undefined
): string | null {
  const trimmed = slug?.trim()
  return trimmed ? trimmed : null
}

/** Returns slug values that appear more than once (already normalized). */
export function findDuplicateSlugs(slugs: ReadonlyArray<string>): string[] {
  const counts = new Map<string, number>()
  for (const slug of slugs) {
    counts.set(slug, (counts.get(slug) ?? 0) + 1)
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug]) => slug)
}
