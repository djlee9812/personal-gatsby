import * as React from 'react'
import Navbar from './navbar'
import Footer from './footer'
import { layoutContainer, contentDiv } from './layout.module.css'
import '@fontsource/inconsolata'
import '@fontsource/josefin-sans'

const Layout = ({ darkNavbar, children }) => {
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