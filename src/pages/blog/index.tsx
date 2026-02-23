import * as React from "react"
import { graphql, PageProps, HeadFC } from 'gatsby'
// @ts-ignore
import { textCenter, navbarMargin, container } from '../../components/global.module.css'
// @ts-ignore
import * as styles from './blog.module.css'
import Layout from '../../components/layout'
import Seo from '../../components/seo'
import BlogLink  from '../../components/blog-link'
import { motion } from 'framer-motion'

interface BlogNode {
  childMdx: {
    excerpt: string
    frontmatter: {
      title: string
      date: string
      slug: string
    }
    id: string
  }
}

interface BlogData {
  allFile: {
    nodes: BlogNode[]
  }
}

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

const Blog = ({ data }: PageProps<BlogData>) => {
  const nodes = data.allFile.nodes;
  
  return (
    <Layout darkNavbar={true}>
      <div className={navbarMargin}>
        <div className={textCenter}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Thoughts, technical logs, and life updates.
          </motion.p>
        </div>
        
        <div className={container}>
          <motion.div 
            className={styles.blogGrid}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {nodes.map((node) => (
              <motion.div key={node.childMdx.id} variants={itemVariants}>
                <BlogLink node={node.childMdx} />
              </motion.div>
            ))}
          </motion.div>
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
          excerpt(pruneLength: 150)
          frontmatter {
            title
            date(formatString:"MMMM D, YYYY")
            slug
          }
          id
        }
      }
    }
  }
`
export const Head: HeadFC = () => <Seo title="Blog" />

export default Blog
