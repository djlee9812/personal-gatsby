import * as React from "react"
import BlogImage, { MarkdownImg, type BlogImageProps } from "./image"
import * as styles from "./asymmetric.module.css"

export type AsymmetricLayout = "auto" | "stack" | "columns"

export type AsymmetricProps = {
  children: React.ReactNode
  /** Swap text/image columns on wide viewports (columns layout only). */
  reverse?: boolean
  /**
   * "auto" (default): two columns when the copy is long enough to balance the
   * image, otherwise a left-aligned single column on the prose rail.
   * "stack" / "columns" force it.
   */
  layout?: AsymmetricLayout
  className?: string
}

/* Below this many characters of body copy, a 2-column row leaves an empty
 * gutter beside the image, so auto layout stacks into the prose column. */
const STACK_CHAR_THRESHOLD = 360

function isFillableImage(
  child: React.ReactNode
): child is React.ReactElement<BlogImageProps> {
  return (
    React.isValidElement(child) &&
    (child.type === BlogImage || child.type === MarkdownImg)
  )
}

function isMediaElement(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false
  if (child.type === BlogImage || child.type === MarkdownImg) return true
  const type = child.type
  if (typeof type === "string") {
    return type === "img" || type === "figure"
  }
  return false
}

function textLength(node: React.ReactNode): number {
  let len = 0
  React.Children.forEach(node, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      len += String(child).length
    } else if (React.isValidElement(child)) {
      len += textLength((child.props as { children?: React.ReactNode }).children)
    }
  })
  return len
}

/**
 * Text + image section for travel/food posts.
 * - Long copy: two-column breakout row (image beside text).
 * - Short copy (or layout="stack"): single column on the prose rail with a
 *   modest left-aligned image, so short blurbs don't leave a tall empty
 *   gutter beside a photo.
 */
const Asymmetric = ({
  children,
  reverse = false,
  layout = "auto",
  className,
}: AsymmetricProps) => {
  const childArray = React.Children.toArray(children)
  const textChildren: React.ReactNode[] = []
  const mediaChildren: React.ReactNode[] = []

  childArray.forEach((child) => {
    if (isMediaElement(child)) {
      mediaChildren.push(child)
    } else {
      textChildren.push(child)
    }
  })

  const media = mediaChildren.map((child, index) => {
    if (isFillableImage(child)) {
      return (
        <div key={child.key ?? index} className={`blog-media ${styles.media}`}>
          {React.cloneElement(child, {
            size: child.props.size ?? "fill",
          })}
        </div>
      )
    }
    return (
      <div
        key={React.isValidElement(child) ? child.key : index}
        className={`blog-media ${styles.media}`}
      >
        {child}
      </div>
    )
  })

  const hasMedia = media.length > 0
  const copyLen = textLength(textChildren)
  const stacked =
    hasMedia &&
    (layout === "stack" ||
      (layout === "auto" && copyLen < STACK_CHAR_THRESHOLD))
  const columns = hasMedia && !stacked

  return (
    <div
      className={[
        // Only columns mode breaks out; stacked/text stay in the prose column
        // so the preceding heading aligns with the content width.
        columns ? "blog-breakout" : undefined,
        styles.asymmetric,
        !hasMedia ? styles.textOnly : undefined,
        stacked ? styles.stacked : undefined,
        columns && reverse ? styles.reverse : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.text}>{textChildren}</div>
      {hasMedia ? (
        media.length > 1 ? (
          <div className={styles.stack}>{media}</div>
        ) : (
          media
        )
      ) : null}
    </div>
  )
}

export default Asymmetric
