import * as React from "react"
import { Link, HeadFC } from "gatsby"
import * as globalStyles from '../components/global.module.css'
import Layout from '../components/layout'
import Seo from '../components/seo'
import * as styles from '../components/404.module.css'
import { motion, useReducedMotion } from 'framer-motion'

const NotFoundPage = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        <div className={styles.notFoundContainer}>
          <motion.h1 
            className={styles.errorCode}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
          >
            404
          </motion.h1>
          
          <motion.div 
            className={styles.content}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
          >
            <h2 className={styles.title}>Page Not Found</h2>
            <p className={styles.message}>
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className={styles.homeLink}>
              Return Home
            </Link>
          </motion.div>
        </div>
      </main>
    </Layout>
  )
}

export const Head: HeadFC = ({ location }) => (
  <Seo title="404: Not Found" pathname={location.pathname} />
)

export default NotFoundPage
