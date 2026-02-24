import * as React from 'react'
import { Link } from 'gatsby'
import * as styles from './navbar.module.css'

const Navbar = () => {
  return (
    <nav className={styles.navbarStyle}>
      <ul className={styles.navLink}>
        <li className={styles.navItem}>
          <Link to="/" activeClassName={styles.active}>Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/gallery" activeClassName={styles.active}>Gallery</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/blog" activeClassName={styles.active}>Blog</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
