
import { graphql, type PageProps, type HeadFC, Link } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import * as globalStyles from '../components/global.module.css'
import * as styles from '../components/blog/blog.module.css'
import Layout from '../components/layout'
import Seo from '../components/seo'
import { blogMdxComponents } from '../components/blog/mdx-components'
import PostNav, { type PostNeighbor } from '../components/blog/post-nav'
import TagList from '../components/blog/tag-list'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../components/blog/blog-fragments'

type BlogPostPageContext = {
  older?: PostNeighbor | null
  newer?: PostNeighbor | null
  showTopNav?: boolean
}

const BlogPost = ({
  data,
  children,
  pageContext,
}: PageProps<Queries.BlogPostQuery, BlogPostPageContext>) => {
  if (!data?.mdx) {
    return (
      <Layout>
        <main className={globalStyles.navbarMargin} id="main">
          <div className={globalStyles.container}>
            <p>Loading or post not found...</p>
            <Link to="/blog">Back to blog</Link>
          </div>
        </main>
      </Layout>
    );
  }

  const { frontmatter } = data.mdx;
  const isEssay = frontmatter?.layout === "essay";
  const { older, newer, showTopNav = false } = pageContext;

  const shellClassName = `${styles.blogContainer}${isEssay ? ` ${styles.blogContainerEssay}` : ""}`

  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        <div className={shellClassName} style={{ marginTop: '2rem' }}>
          <div className={styles.backLinkContainer}>
            <Link to="/blog" className={styles.backLink}>
              <FontAwesomeIcon icon={['fas', 'arrow-left']} aria-hidden="true" /> Back to Blog
            </Link>
          </div>

          <header className={styles.postHeader}>
            <span className={styles.postMeta}>{frontmatter?.date}</span>
            <h1 className={styles.postTitle}>{frontmatter?.title}</h1>
            <TagList tags={frontmatter?.tags} />
            {showTopNav && (
              <PostNav
                older={older}
                newer={newer}
                className={styles.postNavTop}
                aria-label="Adjacent posts before article"
              />
            )}
            <div className={styles.hr} />
          </header>

          <article
            className={`${styles.postContent}${isEssay ? ` ${styles.postContentEssay}` : ""}`}
          >
            <MDXProvider components={blogMdxComponents}>
              {children}
            </MDXProvider>
          </article>

          <PostNav
            older={older}
            newer={newer}
            className={styles.postNavBottom}
            aria-label="Adjacent posts after article"
          />
        </div>
      </main>
    </Layout>
  )
}

export const query = graphql`
  query BlogPost($id: String) {
    mdx(id: {eq: $id}) {
      ...BlogPostFields
      frontmatter {
        layout
      }
    }
  }
`

export const Head: HeadFC<Queries.BlogPostQuery> = ({ data, location }) => {
  const title = data?.mdx?.frontmatter?.title || "Blog Post";
  const description = data?.mdx?.excerpt ?? undefined;
  return (
    <Seo
      title={title}
      description={description}
      pathname={location.pathname}
    />
  );
}

export default BlogPost
