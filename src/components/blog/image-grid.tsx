import * as React from "react"
import BlogImage from "./image"
import * as styles from "./image-grid.module.css"

export type ImageGridItem = {
  src: string
  alt: string
  caption?: string
  /** CSS object-position for cover crop (e.g. "left center", "25% 40%"). */
  objectPosition?: string
  /** CSS object-fit override (default cover in mosaic rows). */
  objectFit?: React.CSSProperties["objectFit"]
  /**
   * Cover box height for this cell at all breakpoints (inline; beats CSS).
   * Prefer `coverHeightMobile` when only small screens need a taller crop.
   * Do not set both — `coverHeight` wins everywhere.
   */
  coverHeight?: string
  /** Cover box height below 640px only; requires `mobile="mosaic"`. */
  coverHeightMobile?: string
}

export type ImageGridProps = {
  images: ImageGridItem[]
  /** Column count on tablet+ (clamped 2–3). Default: 2, or 3 when 3+ images. */
  columns?: 2 | 3
  /**
   * Mobile layout. "stack" (default): full-width column.
   * "mosaic": 2-up cover grid; a leftover 3rd stays one-cell wide and centered.
   */
  mobile?: "stack" | "mosaic"
  className?: string
}

/** Mosaic cells are ~half viewport on small screens; don't advertise 100vw. */
const MOSAIC_SIZES =
  "(max-width: 639px) calc(50vw - 0.5rem), min(28rem, 45vw)"

/**
 * Mid-post mosaic of 2–3 images. Default: equal-height contain row (tablet+).
 * `mobile="mosaic"`: cover-crop 2-up on small screens. Prefer Asymmetric for
 * text+image storytelling.
 */
const ImageGrid = ({
  images,
  columns,
  mobile = "stack",
  className,
}: ImageGridProps) => {
  if (!images?.length) return null

  const cols = columns ?? (images.length >= 3 ? 3 : 2)
  const isMosaic = mobile === "mosaic"

  return (
    <div
      className={[
        "blog-breakout",
        "blog-image-grid",
        styles.grid,
        isMosaic ? styles.mobileMosaic : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-cols={cols}
      data-mobile={mobile}
      style={{ ["--blog-grid-cols" as string]: Math.min(3, Math.max(2, cols)) }}
    >
      {images.map((item, index) => (
        <div
          key={`${item.src}-${index}`}
          className={[
            "blog-media",
            styles.cell,
            item.coverHeightMobile ? "blog-grid-tall-mobile" : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            item.coverHeightMobile
              ? ({
                  ["--cover-height-mobile" as string]: item.coverHeightMobile,
                } as React.CSSProperties)
              : undefined
          }
        >
          <BlogImage
            src={item.src}
            alt={item.alt}
            caption={item.caption}
            objectPosition={item.objectPosition}
            objectFit={item.objectFit}
            coverHeight={item.coverHeight}
            sizes={isMosaic ? MOSAIC_SIZES : undefined}
            size="fill"
          />
        </div>
      ))}
    </div>
  )
}

export default ImageGrid
