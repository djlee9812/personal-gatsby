import * as React from "react"
import { Link, HeadFC } from "gatsby"
import * as globalStyles from '../components/global.module.css'
import Layout from '../components/layout'
import Seo from '../components/seo'
import * as styles from '../components/404.module.css'
import { motion } from 'framer-motion'

const NotFoundPage = () => {
  return (
    <Layout>
      <main className={globalStyles.navbarMargin}>
        <div className={styles.notFoundContainer}>
          <motion.h1 
            className={styles.errorCode}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            404
          </motion.h1>
          
          <motion.div 
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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

export const Head: HeadFC = () => <Seo title="404: Not Found" />

export default NotFoundPage
