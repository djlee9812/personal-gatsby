/**
 * Layout / breakpoint scale.
 *
 * CSS `@media` cannot use custom properties reliably, so keep numeric values
 * here for JS (`matchMedia`, `sizes`) and mirror the same numbers in CSS modules.
 * Layout max-widths use `--layout-max-*` in `global.module.css`.
 *
 * Exclusive pairs: mobile `max-width: ${BP.mdMax}px` / desktop `min-width: ${BP.md}px`.
 */
export const BP = {
  /** Mobile-only (exclusive of tablet). */
  mdMax: 767,
  /** Tablet and up. */
  md: 768,
  /** Stacked page sections (home / projects). */
  pageMax: 900,
  /** Hero WebGL desktop gate. */
  heroMin: 901,
} as const

export const DESKTOP_HERO_QUERY = `(min-width: ${BP.heroMin}px)`

/** `sizes` attribute prefix for below-tablet layouts. */
export const SIZES_BELOW_MD = `(max-width: ${BP.mdMax}px)`

/** `sizes` attribute prefix for stacked page sections. */
export const SIZES_BELOW_PAGE = `(max-width: ${BP.pageMax}px)`
