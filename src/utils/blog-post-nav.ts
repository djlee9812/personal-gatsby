export const TOP_NAV_MIN_WORDS = 200

export type PostNeighbor = {
  slug: string
  /** Empty when frontmatter title is missing */
  title: string
}

export type PostNavSource = {
  slug: string
  title?: string | null
}

/**
 * Rough prose word count for gating top nav. Strips common MDX/JSX noise so
 * imports and component tags do not inflate the threshold.
 */
export function countPostWords(text: string | null | undefined): number {
  if (!text) return 0
  const cleaned = text
    .replace(/^import\s.+$/gm, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
  return cleaned.trim().split(/\s+/).filter(Boolean).length
}

export function toNeighbor(
  post: PostNavSource | null | undefined
): PostNeighbor | null {
  if (!post) return null
  const slug = post.slug?.trim()
  if (!slug) return null
  return { slug, title: post.title?.trim() ? post.title.trim() : "" }
}

/** Date-DESC list: index 0 = newest. Newer = lower index; older = higher. */
export function getNeighbors(
  posts: ReadonlyArray<PostNavSource>,
  index: number
): { older: PostNeighbor | null; newer: PostNeighbor | null } {
  return {
    newer: index > 0 ? toNeighbor(posts[index - 1]) : null,
    older: index < posts.length - 1 ? toNeighbor(posts[index + 1]) : null,
  }
}

export function shouldShowTopNav(wordCount: number): boolean {
  return wordCount >= TOP_NAV_MIN_WORDS
}
