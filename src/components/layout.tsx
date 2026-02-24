import * as React from 'react'
import Navbar from './navbar'
import Footer from './footer'
import * as styles from './layout.module.css'
import '@fontsource/inconsolata'
import '@fontsource/josefin-sans'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Navbar />
      <div className={styles.contentDiv}>
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default Layout
