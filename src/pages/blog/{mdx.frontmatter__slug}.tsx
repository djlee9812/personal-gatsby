import * as React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import * as globalStyles from '../../components/global.module.css'
import * as styles from './blog.module.css'
import Layout from '../../components/layout'
import Seo from '../../components/seo'
import { motion } from 'framer-motion'

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
    <Layout>
      <div className={globalStyles.navbarMargin}>
        <motion.div 
          className={globalStyles.container}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className={styles.postHeader}>
            <span className={styles.postMeta}>{data.mdx.frontmatter.date}</span>
            <h1 className={styles.postTitle}>{data.mdx.frontmatter.title}</h1>
            <div className={styles.hr} />
          </header>
          
          <article className={styles.postContent}>
            {children}
          </article>
        </motion.div>
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
