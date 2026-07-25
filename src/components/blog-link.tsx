import * as React from "react"
import { Link } from 'gatsby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as styles from '../pages/blog/blog.module.css'
import { normalizeBlogSlug } from '../utils/blog-slug'

type BlogLinkNode = NonNullable<
  Queries.BlogIndexQuery["allFile"]["nodes"][number]["childMdx"]
>

interface BlogLinkProps {
  node: BlogLinkNode
}

const BlogLink = ({ node }: BlogLinkProps) => {
  const frontmatter = node?.frontmatter;
  const title = frontmatter?.title?.trim() || "Untitled";
  const date = frontmatter?.date;
  const slug = normalizeBlogSlug(frontmatter?.slug);
  const tags = frontmatter?.tags?.filter((tag): tag is string => Boolean(tag)) ?? [];

  if (!slug) {
    return null
  }

  return (
    <Link to={`/blog/${slug}`} className={styles.blogCard}>
      <div className={styles.blogMeta}>
        <span className={styles.blogDate}>{date}</span>
      </div>
      <h3>{title}</h3>
      {tags.length > 0 && (
        <ul className={styles.tagList} aria-label="Tags">
          {tags.map((tag) => (
            <li key={tag} className={styles.tag}>{tag}</li>
          ))}
        </ul>
      )}
      <p className={styles.blogExcerpt}>{node.excerpt}</p>
      <div className={styles.readMore}>
        Read Post <FontAwesomeIcon icon={['fas', 'arrow-right']} size="xs" aria-hidden="true" />
      </div>
    </Link>
  )
}

export default BlogLink
