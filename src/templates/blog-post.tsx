import * as React from 'react'
import { graphql, PageProps, HeadFC, Link } from 'gatsby'
import * as globalStyles from '../components/global.module.css'
import * as styles from '../pages/blog/blog.module.css'
import Layout from '../components/layout'
import Seo from '../components/seo'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const BlogPost = ({ data, children }: PageProps<Queries.BlogPostQuery>) => {
  if (!data || !data.mdx) {
    return (
      <Layout>
        <div className={globalStyles.navbarMargin}>
          <div className={globalStyles.container}>
            <p>Loading or post not found...</p>
            <Link to="/blog">Back to blog</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const { frontmatter } = data.mdx;
  const tags = frontmatter?.tags?.filter((tag): tag is string => Boolean(tag)) ?? [];

  return (
    <Layout>
      <div className={globalStyles.navbarMargin}>
        <motion.div 
          className={styles.blogContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginTop: '2rem' }}
        >
          <div className={styles.backLinkContainer}>
            <Link to="/blog" className={styles.backLink}>
              <FontAwesomeIcon icon={['fas', 'arrow-left']} /> Back to Blog
            </Link>
          </div>
          
          <header className={styles.postHeader}>
            <span className={styles.postMeta}>{frontmatter?.date}</span>
            <h1 className={styles.postTitle}>{frontmatter?.title}</h1>
            {tags.length > 0 && (
              <ul className={`${styles.tagList} ${styles.tagListCentered}`} aria-label="Tags">
                {tags.map((tag) => (
                  <li key={tag} className={styles.tag}>{tag}</li>
                ))}
              </ul>
            )}
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
  query BlogPost($id: String) {
    mdx(id: {eq: $id}) {
      frontmatter {
        title
        date(formatString: "MMMM D, YYYY")
        tags
      }
      excerpt(pruneLength: 160)
    }
  }
`

export const Head: HeadFC<Queries.BlogPostQuery> = ({ data }) => {
  const title = data?.mdx?.frontmatter?.title || "Blog Post";
  const description = data?.mdx?.excerpt ?? undefined;
  return <Seo title={title} description={description} />;
}

export default BlogPost
