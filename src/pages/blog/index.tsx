
import { graphql, type PageProps, type HeadFC } from 'gatsby'
import * as globalStyles from '../../components/global.module.css'
import * as styles from '../../components/blog/blog.module.css'
import Layout from '../../components/animated-layout'
import Seo from '../../components/seo'
import BlogLink  from '../../components/blog-link'
import { m } from 'framer-motion'
import { normalizeBlogSlug } from '../../utils/blog-slug'
import { blogListContainer, blogListItem } from '../../utils/motion-variants'
import { useAllowMotion } from '../../hooks/use-allow-motion'
import '../../components/blog/blog-fragments'

const Blog = ({ data }: PageProps<Queries.BlogIndexQuery>) => {
  const nodes = data.allFile.nodes;
  const { allowMotion, enterInitial } = useAllowMotion();
  
  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        <div className={`${globalStyles.pageHeader} ${globalStyles.pageHeaderTop} ${globalStyles.textCenter}`}>
          <m.h1
            initial={allowMotion ? { opacity: 0, y: -20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={allowMotion ? { duration: 0.5 } : { duration: 0 }}
          >
            Blog
          </m.h1>
          <m.p
            initial={allowMotion ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={allowMotion ? { duration: 0.5, delay: 0.2 } : { duration: 0 }}
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
                <m.div key={mdx.id} className={styles.blogGridItem} variants={blogListItem}>
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
      sort: [
        { childMdx: { frontmatter: { date: DESC } } }
        { childMdx: { frontmatter: { slug: ASC } } }
      ]
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
