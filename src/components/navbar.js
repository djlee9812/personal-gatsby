import * as React from 'react'
import { Link } from 'gatsby'
import { navbarStyle, navbarBackground, navLink, navItem } from './navbar.module.css'

const Navbar = ({ darkNavbar }) => {
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