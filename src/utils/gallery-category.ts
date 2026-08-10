/**
 * Primary Cloudinary tag used for gallery collections.
 * Matches historical gallery grouping: only `tags[0]` (trimmed).
 * Untagged images, empty first tags, and the explicit "misc" tag are excluded.
 */
export function resolveGalleryCategory(
  tags: ReadonlyArray<string | null | undefined> | null | undefined,
): string | null {
  const category = tags?.[0]?.trim()
  if (!category || category === "misc") return null
  return category
}
