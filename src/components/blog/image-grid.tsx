import * as React from "react"
import BlogImage from "./image"
import * as styles from "./image-grid.module.css"

export type ImageGridItem = {
  src: string
  alt: string
  caption?: string
}

export type ImageGridProps = {
  images: ImageGridItem[]
  /** Column count on tablet+ (clamped 2–3). Default: 2, or 3 when 3+ images. */
  columns?: 2 | 3
  className?: string
}

/**
 * Mid-post mosaic of 2–3 images. Prefer Asymmetric for text+image storytelling.
 */
const ImageGrid = ({ images, columns, className }: ImageGridProps) => {
  if (!images?.length) return null

  const cols = columns ?? (images.length >= 3 ? 3 : 2)

  return (
    <div
      className={["blog-breakout", "blog-image-grid", styles.grid, className]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--blog-grid-cols" as string]: Math.min(3, Math.max(2, cols)) }}
    >
      {images.map((item) => (
        <div key={item.src} className={`blog-media ${styles.cell}`}>
          <BlogImage
            src={item.src}
            alt={item.alt}
            caption={item.caption}
            size="fill"
          />
        </div>
      ))}
    </div>
  )
}

export default ImageGrid
