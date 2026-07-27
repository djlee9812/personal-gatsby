import type * as React from 'react'
import Navbar from './navbar'
import Footer from './footer'
import * as styles from './layout.module.css'
/* Side-effect: :root tokens + body styles must load on every route (incl. homepage). */
import './global.module.css'
import '@fontsource/inconsolata/latin-400.css'
import '@fontsource/inconsolata/latin-600.css'
import '@fontsource/inconsolata/latin-700.css'
import '@fontsource/josefin-sans/latin-400.css'
import '@fontsource/josefin-sans/latin-600.css'
import '@fontsource/josefin-sans/latin-700.css'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skipLink}>Skip to content</a>
      <Navbar />
      <div className={styles.contentDiv}>
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default Layout
