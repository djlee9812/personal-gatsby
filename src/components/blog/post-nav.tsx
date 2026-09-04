
import { Link } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as styles from "./blog.module.css"
import type { PostNeighbor } from "../../utils/blog-post-nav"

export type { PostNeighbor }

export type PostNavProps = {
  older?: PostNeighbor | null
  newer?: PostNeighbor | null
  className?: string
  /** Distinguishes duplicate nav landmarks on the same page */
  "aria-label"?: string
}

function NeighborLink({
  direction,
  neighbor,
}: {
  direction: "Older" | "Newer"
  neighbor: PostNeighbor
}) {
  const isOlder = direction === "Older"

  return (
    <Link
      to={`/blog/${neighbor.slug}`}
      className={`${styles.backLink} ${styles.postNavLink} ${
        isOlder ? styles.postNavOlder : styles.postNavNewer
      }`}
      {...(neighbor.title ? {} : { "aria-label": `${direction} post` })}
    >
      <span className={styles.postNavChevron} aria-hidden="true">
        <FontAwesomeIcon
          icon={["fas", isOlder ? "chevron-left" : "chevron-right"]}
        />
      </span>
      <span className={styles.postNavDir}>{direction}</span>
      {neighbor.title ? (
        <span className={styles.postNavTitle}>{neighbor.title}</span>
      ) : null}
    </Link>
  )
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
        <NeighborLink direction="Older" neighbor={older} />
      ) : (
        <span className={styles.postNavSpacer} aria-hidden="true" />
      )}
      {newer ? (
        <NeighborLink direction="Newer" neighbor={newer} />
      ) : (
        <span className={styles.postNavSpacer} aria-hidden="true" />
      )}
    </nav>
  )
}

export default PostNav
