import * as React from "react"
import { Link } from 'gatsby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as styles from '../pages/blog/blog.module.css'

interface BlogLinkProps {
  node: Queries.Mdx
}

const BlogLink = ({ node }: BlogLinkProps) => {
  const frontmatter = node?.frontmatter;
  const title = frontmatter?.title;
  const date = frontmatter?.date;
  const slug = frontmatter?.slug;
  
  return (
    <Link to={`/blog/${slug}`} className={styles.blogCard}>
      <span className={styles.blogDate}>{date}</span>
      <h3>{title}</h3>
      <p className={styles.blogExcerpt}>{node.excerpt}</p>
      <div className={styles.readMore}>
        Read Post <FontAwesomeIcon icon="arrow-right" size="xs" />
      </div>
    </Link>
  )
}

export default BlogLink
