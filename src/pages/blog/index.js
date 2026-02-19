import * as React from "react"
import { graphql } from 'gatsby'
import { textCenter, navbarMargin, container } from '../../components/global.module.css'
import Layout from '../../components/layout'
import Seo from '../../components/seo'
import BlogLink  from '../../components/blog-link'

const Blog = ({ data }) => {
  const nodes = data.allFile.nodes;
  return (
    <Layout darkNavbar={true}>
      <div className={navbarMargin}>
        <div className={textCenter}>
          <h1>Blog</h1>
          <p>Random things</p>
        </div>
        <div className={container}>
          {nodes.map((node) => {
            return (
              <BlogLink key={node.childMdx.id} node={node.childMdx} />
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query {
    allFile(
      sort: {childMdx: {frontmatter: {date: DESC}}}
      filter: {sourceInstanceName: {eq: "blogs"}}
    ) {
      nodes {
        childMdx {
          frontmatter {
            title
            date(formatString:"MMMM D, YYYY")
            slug
          }
          id
          body
        }
      }
    }
  }
`
export const Head = () => <Seo title="Blog" />

export default Blog
