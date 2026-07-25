import * as React from "react"
import { graphql, PageProps, HeadFC } from 'gatsby'
import * as globalStyles from '../../components/global.module.css'
import * as styles from './blog.module.css'
import Layout from '../../components/layout'
import Seo from '../../components/seo'
import BlogLink  from '../../components/blog-link'
import { motion, useReducedMotion } from 'framer-motion'
import { normalizeBlogSlug } from '../../utils/blog-slug'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const Blog = ({ data }: PageProps<Queries.BlogIndexQuery>) => {
  const nodes = data.allFile.nodes;
  const prefersReducedMotion = useReducedMotion();
  const enterInitial = prefersReducedMotion ? false : "hidden";
  
  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        <div className={`${globalStyles.pageHeader} ${globalStyles.pageHeaderTop} ${globalStyles.textCenter}`}>
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
          >
            Blog
          </motion.h1>
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
          >
            Thoughts, technical logs, and life updates.
          </motion.p>
        </div>
        
        <div className={globalStyles.container}>
          <motion.div 
            className={styles.blogGrid}
            variants={containerVariants}
            initial={enterInitial}
            animate="show"
          >
            {nodes.map((node) => {
              const mdx = node.childMdx
              if (!mdx || !normalizeBlogSlug(mdx.frontmatter?.slug)) return null
              return (
                <motion.div key={mdx.id} variants={itemVariants}>
                  <BlogLink node={mdx} />
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </main>
    </Layout>
  )
}

export const query = graphql`
  query BlogIndex {
    allFile(
      sort: {childMdx: {frontmatter: {date: DESC}}}
      filter: {sourceInstanceName: {eq: "blogs"}}
    ) {
      nodes {
        childMdx {
          excerpt(pruneLength: 150)
          frontmatter {
            title
            date(formatString:"MMMM D, YYYY")
            slug
            tags
          }
          id
        }
      }
    }
  }
`
export const Head: HeadFC = ({ location }) => (
  <Seo title="Blog" pathname={location.pathname} />
)

export default Blog
