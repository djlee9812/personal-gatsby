import * as React from "react"
import { Link } from 'gatsby'

const BlogLink = ({ node }) => {
  const title = node.frontmatter.title;
  const date = node.frontmatter.date;
  const slug = node.slug;
  return (
    <Link to={`/blog/${slug}`}>
      <h3>{title}</h3>
      <p>{date}</p>
    </Link>
  )
}

export default BlogLink
