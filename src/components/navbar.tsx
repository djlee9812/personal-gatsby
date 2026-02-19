import * as React from 'react'
import { Link } from 'gatsby'
// @ts-ignore
import { navbarStyle, navbarBackground, navLink, navItem } from './navbar.module.css'

interface NavbarProps {
  darkNavbar?: boolean
}

const Navbar = ({ darkNavbar }: NavbarProps) => {
  let navStyle = navbarStyle
  if (darkNavbar) {
    navStyle = `${navbarStyle} ${navbarBackground}`;
  }
  const activeStyle = {color: "#d4fcff"};
  return (
    <nav className={navStyle}>
      <ul className={navLink}>
        <li className={navItem}>
          <Link to="/" activeStyle={activeStyle}>Home</Link>
        </li>
        <li className={navItem}>
          <Link to="/gallery" activeStyle={activeStyle}>Gallery</Link>
        </li>
        <li className={navItem}>
          <Link to="/blog" activeStyle={activeStyle}>Blog</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
