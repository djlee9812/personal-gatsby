import * as React from "react"
import { graphql } from 'gatsby'
import Layout from '../../components/layout'
import { textCenter, navbarMargin, container } from '../../components/global.module.css'
import BlogLink  from '../../components/blog-link'

const Blog = ({ data }) => {
  const nodes = data.allMdx.nodes;
  return (
    <Layout pageTitle="Dongjoon Lee | Blog" darkNavbar={true}>
      <div className={navbarMargin}>
        <div className={textCenter}>
          <h1>Blog</h1>
          <p>Random things</p>
        </div>
        <div className={container}>
          {nodes.map((node) => {
            return (
              <BlogLink key={node.id} node={node} />
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query {
  allMdx(filter: {fileAbsolutePath: {regex: "/(blogs)/"}}, sort:{fields: frontmatter___date, order: DESC}) {
    nodes {
      id
      frontmatter {
        title
        date(formatString:"MMMM D, YYYY")
      }
      id
      body
      slug
    }
  }
}


`

export default Blog
