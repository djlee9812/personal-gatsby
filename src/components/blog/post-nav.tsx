import * as React from "react"
import { Link } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as styles from "../../pages/blog/blog.module.css"
import type { PostNeighbor } from "../../utils/blog-post-nav"

export type { PostNeighbor }

export type PostNavProps = {
  older?: PostNeighbor | null
  newer?: PostNeighbor | null
  className?: string
  /** Distinguishes duplicate nav landmarks on the same page */
  "aria-label"?: string
}

function neighborAriaLabel(direction: "Older" | "Newer", title: string): string {
  return title ? `${direction} post: ${title}` : `${direction} post`
}

const PostNav = ({
  older,
  newer,
  className,
  "aria-label": ariaLabel = "Adjacent posts",
}: PostNavProps) => {
  if (!older && !newer) {
    return null
  }

  const navClassName = [styles.postNav, className].filter(Boolean).join(" ")

  return (
    <nav className={navClassName} aria-label={ariaLabel}>
      {older ? (
        <Link
          to={`/blog/${older.slug}`}
          className={`${styles.backLink} ${styles.postNavLink} ${styles.postNavOlder}`}
          aria-label={neighborAriaLabel("Older", older.title)}
        >
          <FontAwesomeIcon icon={["fas", "chevron-left"]} aria-hidden="true" />
          Older
        </Link>
      ) : (
        <span className={styles.postNavSpacer} aria-hidden="true" />
      )}
      {newer ? (
        <Link
          to={`/blog/${newer.slug}`}
          className={`${styles.backLink} ${styles.postNavLink} ${styles.postNavNewer}`}
          aria-label={neighborAriaLabel("Newer", newer.title)}
        >
          Newer
          <FontAwesomeIcon icon={["fas", "chevron-right"]} aria-hidden="true" />
        </Link>
      ) : (
        <span className={styles.postNavSpacer} aria-hidden="true" />
      )}
    </nav>
  )
}

export default PostNav
