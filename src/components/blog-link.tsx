import * as React from "react"
import { Link } from 'gatsby'

interface BlogLinkProps {
  node: {
    frontmatter: {
      title: string
      date: string
      slug: string
    }
  }
}

const BlogLink = ({ node }: BlogLinkProps) => {
  const title = node.frontmatter.title;
  const date = node.frontmatter.date;
  const slug = node.frontmatter.slug;
  return (
    <Link to={`/blog/${slug}`}>
      <h3>{title}</h3>
      <p>{date}</p>
    </Link>
  )
}

export default BlogLink
