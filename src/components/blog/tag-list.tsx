
import * as styles from "./tag-list.module.css"

type TagListProps = {
  tags?: readonly (string | null | undefined)[] | null
  className?: string
}

const TagList = ({ tags = [], className }: TagListProps) => {
  const items = Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter(Boolean)
    )
  )
  if (items.length === 0) return null

  return (
    <ul
      className={[styles.tagList, className].filter(Boolean).join(" ")}
      aria-label="Tags"
    >
      {items.map((tag) => (
        <li key={tag} className={styles.tag}>
          {tag}
        </li>
      ))}
    </ul>
  )
}

export default TagList
