
import { graphql, type PageProps, type HeadFC } from 'gatsby'
import * as globalStyles from '../../components/global.module.css'
import * as styles from '../../components/blog/blog.module.css'
import Layout from '../../components/animated-layout'
import Seo from '../../components/seo'
import BlogLink  from '../../components/blog-link'
import { m, useReducedMotion } from 'framer-motion'
import { normalizeBlogSlug } from '../../utils/blog-slug'
import { blogListContainer, blogListItem } from '../../utils/motion-variants'
import '../../components/blog/blog-fragments'

const Blog = ({ data }: PageProps<Queries.BlogIndexQuery>) => {
  const nodes = data.allFile.nodes;
  const prefersReducedMotion = useReducedMotion();
  const enterInitial = prefersReducedMotion ? false : "hidden";
  
  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        <div className={`${globalStyles.pageHeader} ${globalStyles.pageHeaderTop} ${globalStyles.textCenter}`}>
          <m.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
          >
            Blog
          </m.h1>
          <m.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
          >
            Thoughts, technical logs, and life updates.
          </m.p>
        </div>
        
        <div className={globalStyles.container}>
          <m.div 
            className={styles.blogGrid}
            variants={blogListContainer}
            initial={enterInitial}
            animate="show"
          >
            {nodes.map((node) => {
              const mdx = node.childMdx
              if (!mdx || !normalizeBlogSlug(mdx.frontmatter?.slug)) return null
              return (
                <m.div key={mdx.id} variants={blogListItem}>
                  <BlogLink node={mdx} />
                </m.div>
              )
            })}
          </m.div>
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
          ...BlogPostCardFields
        }
      }
    }
  }
`
export const Head: HeadFC = ({ location }) => (
  <Seo title="Blog" pathname={location.pathname} />
)

export default Blog
