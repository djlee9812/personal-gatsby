import * as React from 'react'
import { graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import Layout from '../../components/layout'
import { navbarMargin, container } from '../../components/global.module.css'


const BlogPost = ({ data }) => {
  return (
    <Layout pageTitle={data.mdx.frontmatter.title} darkNavbar={true}>
      <div className={navbarMargin}>
        <div className={container}>
          <p>{data.mdx.frontmatter.date}</p>
          <MDXRenderer>
            {data.mdx.body}
          </MDXRenderer>
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query ($id: String) {
    mdx(id: {eq: $id}) {
      frontmatter {
        title
        date(formatString: "MMMM D, YYYY")
      }
      body
    }
  }
`

export default BlogPost