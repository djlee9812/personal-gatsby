import { graphql } from "gatsby"

/**
 * Shared MDX fields for blog index cards and post templates.
 * Gatsby collects fragments from any imported module that uses `graphql`.
 *
 * excerpt pruneLength is a GraphQL literal (cannot use a TS constant) — keep
 * card + SEO consumers aligned with pruneLength: 160 below.
 */
export const blogPostFields = graphql`
  fragment BlogPostFields on Mdx {
    id
    excerpt(pruneLength: 160)
    frontmatter {
      title
      date(formatString: "MMMM D, YYYY")
      slug
      tags
    }
  }
`

export const blogPostCardFields = graphql`
  fragment BlogPostCardFields on Mdx {
    ...BlogPostFields
  }
`
