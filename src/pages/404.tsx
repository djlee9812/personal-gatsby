
import { Link, type HeadFC } from "gatsby"
import * as globalStyles from '../components/global.module.css'
import Layout from '../components/layout'
import Seo from '../components/seo'
import * as styles from '../components/404.module.css'

const NotFoundPage = () => {
  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        <div className={styles.notFoundContainer}>
          <h1 className={styles.errorCode}>
            404
          </h1>
          
          <div className={styles.content}>
            <h2 className={styles.title}>Page Not Found</h2>
            <p className={styles.message}>
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className={styles.homeLink}>
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export const Head: HeadFC = ({ location }) => (
  <Seo title="404: Not Found" pathname={location.pathname} />
)

export default NotFoundPage
