
import { Link } from 'gatsby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as styles from './blog/blog.module.css'
import TagList from './blog/tag-list'
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

  if (!slug) {
    return null
  }

  return (
    <Link to={`/blog/${slug}`} className={styles.blogCard}>
      <div className={styles.blogMeta}>
        <span className={styles.blogDate}>{date}</span>
      </div>
      <h3>{title}</h3>
      <TagList tags={frontmatter?.tags} />
      {node.excerpt?.trim() ? (
        <p className={styles.blogExcerpt}>{node.excerpt.trim()}</p>
      ) : null}
      <div className={styles.readMore}>
        Read Post
        <FontAwesomeIcon
          icon={['fas', 'arrow-right']}
          size="xs"
          aria-hidden="true"
          className={styles.readMoreIcon}
        />
      </div>
    </Link>
  )
}

export default BlogLink
