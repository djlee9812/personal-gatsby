import * as React from 'react'
import Navbar from './navbar'
import Footer from './footer'
// @ts-ignore
import { layoutContainer, contentDiv } from './layout.module.css'
import '@fontsource/inconsolata'
import '@fontsource/josefin-sans'

interface LayoutProps {
  darkNavbar?: boolean
  children: React.ReactNode
}

const Layout = ({ darkNavbar, children }: LayoutProps) => {
  return (
    <div className={layoutContainer}>
      <Navbar darkNavbar={darkNavbar}/>
      <div className={contentDiv}>
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default Layout
