import * as React from 'react'
import { graphql, PageProps, HeadFC, Link } from 'gatsby'
import * as globalStyles from '../components/global.module.css'
import * as styles from '../pages/blog/blog.module.css'
import Layout from '../components/layout'
import Seo from '../components/seo'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
  console.log(data);
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

  return (
    <Layout>
      <div className={globalStyles.navbarMargin}>
        <motion.div 
          className={`${globalStyles.container} ${styles.blogContainer}`}
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
            <span className={styles.postMeta}>{frontmatter.date}</span>
            <h1 className={styles.postTitle}>{frontmatter.title}</h1>
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

export const Head: HeadFC<BlogPostData> = ({ data }) => {
  const title = data?.mdx?.frontmatter?.title || "Blog Post";
  return <Seo title={title} />;
}

export default BlogPost
