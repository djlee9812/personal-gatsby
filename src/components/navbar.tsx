import * as React from 'react'
import { Link } from 'gatsby'
// @ts-ignore
import { navbarStyle, navLink, navItem, active } from './navbar.module.css'

interface NavbarProps {
  darkNavbar?: boolean
}

const Navbar = ({ darkNavbar }: NavbarProps) => {
  return (
    <nav className={navbarStyle}>
      <ul className={navLink}>
        <li className={navItem}>
          <Link to="/" activeClassName={active}>Home</Link>
        </li>
        <li className={navItem}>
          <Link to="/gallery" activeClassName={active}>Gallery</Link>
        </li>
        <li className={navItem}>
          <Link to="/blog" activeClassName={active}>Blog</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
