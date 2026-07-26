import type * as React from "react"
import { optimizeCloudinaryImage } from "../../utils/cloudinary"
import { SIZES_BELOW_MD } from "../../styles/breakpoints"
import * as styles from "./image.module.css"

export type BlogImageSize = "content" | "wide" | "full" | "fill"

export type BlogImageProps = {
  src: string
  alt?: string
  caption?: string
  size?: BlogImageSize
  /** Left-align within the prose measure (e.g. passport / document shots). */
  align?: "center" | "left"
  /**
   * Intrinsic pixel size of the source. When both are set, the browser
   * reserves the correct aspect ratio before load (CLS) without cropping.
   */
  width?: number
  height?: number
  /** CSS object-position when the layout crops (e.g. ImageGrid cover). */
  objectPosition?: string
  /** CSS object-fit override (ImageGrid defaults to cover). */
  objectFit?: React.CSSProperties["objectFit"]
  /**
   * CSS height for cover-crop layouts (ImageGrid). Separate from intrinsic
   * `height` (source pixels). e.g. "min(42vh, 26rem)" for tall portraits.
   */
  coverHeight?: string
  /** Override Cloudinary/layout `sizes` (e.g. ImageGrid mosaic ~50vw cells). */
  sizes?: string
  className?: string
  loading?: "lazy" | "eager"
}

const SIZES_ATTR: Record<BlogImageSize, string> = {
  content: `${SIZES_BELOW_MD} 100vw, min(42rem, 100%)`,
  wide: `${SIZES_BELOW_MD} 100vw, min(100vw - 2rem, 56rem)`,
  full: "100vw",
  /* Half-column Asymmetric / ImageGrid cells — avoid content-width downloads */
  fill: `${SIZES_BELOW_MD} 100vw, min(28rem, 45vw)`,
}

/* Left-aligned content (passport / docs) caps at ~18rem in CSS */
const SIZES_CONTENT_LEFT = `${SIZES_BELOW_MD} 100vw, min(18rem, 100%)`

const DEFAULT_WIDTH: Record<BlogImageSize, number> = {
  content: 800,
  wide: 1200,
  full: 1600,
  fill: 960,
}

const DEFAULT_WIDTH_CONTENT_LEFT = 640

/** Coerce MDX/HTML width|height (number or numeric string) to a finite number. */
export function coerceDim(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

/**
 * Markdown `![alt](src)` → BlogImage. Accepts `size` so Asymmetric can
 * cloneElement(..., { size: "fill" }) the same way as `<Image />`.
 */
export const MarkdownImg = (
  props: React.ImgHTMLAttributes<HTMLImageElement> & {
    size?: BlogImageSize
    caption?: string
    align?: BlogImageProps["align"]
  }
) => {
  const { src, alt, width, height, loading, className, size, caption, align } =
    props
  if (!src || typeof src !== "string") return null

  const imageProps: BlogImageProps = {
    src,
    alt: typeof alt === "string" ? alt : "",
    size: size ?? "content",
    className,
    caption,
    align,
    loading: loading === "eager" ? "eager" : "lazy",
  }

  const w = coerceDim(width)
  const h = coerceDim(height)
  if (w !== undefined) imageProps.width = w
  if (h !== undefined) imageProps.height = h

  return <BlogImage {...imageProps} />
}

/**
 * First-class blog image: Cloudinary-optimized, caption-aware, size variants.
 * Used as MDX shortcode `<Image />` and as the default markdown `img` mapping.
 */
const BlogImage = ({
  src,
  alt = "",
  caption,
  size = "content",
  align = "center",
  width,
  height,
  objectPosition,
  objectFit,
  coverHeight,
  sizes: sizesOverride,
  className,
  loading = "lazy",
}: BlogImageProps) => {
  if (!src) return null

  const isContentLeft = size === "content" && align === "left"
  const sizes =
    sizesOverride ??
    (isContentLeft ? SIZES_CONTENT_LEFT : SIZES_ATTR[size])
  const optimized = optimizeCloudinaryImage(src, {
    // Delivery width is layout-based — never use intrinsic CLS dims here
    // (AUTHORING may pass width={4032} for aspect-ratio only).
    width: isContentLeft ? DEFAULT_WIDTH_CONTENT_LEFT : DEFAULT_WIDTH[size],
    sizes,
  })

  const figureClass = [
    size === "fill" ? styles.figureFill : styles.figure,
    size === "fill"
      ? undefined
      : size === "wide"
        ? styles.wide
        : size === "full"
          ? styles.full
          : align === "left"
            ? styles.contentLeft
            : styles.content,
    className,
  ]
    .filter(Boolean)
    .join(" ")

  /* Intrinsic ratio for CLS; crop framing for ImageGrid cover layouts. */
  const imgStyle: React.CSSProperties | undefined =
    width || height || objectPosition || objectFit || coverHeight
      ? {
          ...(width && height ? { aspectRatio: `${width} / ${height}` } : null),
          ...(objectPosition ? { objectPosition } : null),
          ...(objectFit ? { objectFit } : null),
          ...(coverHeight ? { height: coverHeight } : null),
        }
      : undefined

  const img = (
    <img
      className={styles.img}
      style={imgStyle}
      src={optimized.src}
      srcSet={optimized.srcSet}
      sizes={optimized.sizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      // Eager images are typically LCP candidates (e.g. first essay photo).
      {...(loading === "eager" ? { fetchPriority: "high" as const } : {})}
      decoding="async"
    />
  )

  // Fill mode (Asymmetric / ImageGrid): parent owns layout width; always use
  // <figure> so caption and no-caption paths share the same CSS hooks.
  return (
    <figure className={figureClass}>
      {img}
      {caption ? (
        <figcaption
          className={
            size !== "fill" && align === "left" ? "blog-caption-left" : undefined
          }
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export default BlogImage
