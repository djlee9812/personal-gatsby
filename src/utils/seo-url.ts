/** Canonical / Open Graph URL from site root + optional page pathname. */
export function buildSeoUrl(
  siteUrl: string | null | undefined,
  pathname?: string | null
): string {
  return `${siteUrl ?? ""}${pathname || ""}`
}
