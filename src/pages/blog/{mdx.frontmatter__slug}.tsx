import * as React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
// @ts-ignore
import { navbarMargin, container } from '../../components/global.module.css'
import Layout from '../../components/layout'
import Seo from '../../components/seo'

interface BlogPostData {
  mdx: {
    frontmatter: {
      title: string
      date: string
    }
    body: string
  }
}

const BlogPost = ({ data, children }: PageProps<BlogPostData>) => {
  return (
    <Layout darkNavbar={true}>
      <div className={navbarMargin}>
        <div className={container}>
          <h3>{data.mdx.frontmatter.title}</h3>
          <p>{data.mdx.frontmatter.date}</p>
          {children}
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

export const Head: HeadFC<BlogPostData> = ({ data }) => <Seo title={data.mdx.frontmatter.title} />

export default BlogPost
