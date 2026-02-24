import * as React from 'react'
import * as styles from './footer.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Footer = () => {
  return (
    <footer className={styles.footerDiv}>
      <p>Made by Dongjoon Lee</p>
      <div id="links-div">
        <ul className={styles.links}>
          <li>
            <a href="https://www.github.com/djlee9812/" aria-label="Github link">
            <FontAwesomeIcon icon={['fab', 'github']} />
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/djlee9812/" aria-label="Instagram link">
            <FontAwesomeIcon icon={['fab', 'instagram']} />
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/dongjoon-lee/" aria-label="LinkedIn link">
            <FontAwesomeIcon icon={['fab', 'linkedin']} />
            </a>
          </li>
          <li>
            <a href="https://www.goodreads.com/dongjoonlee/" aria-label="GoodReads link">
            <FontAwesomeIcon icon={['fab', 'goodreads']} />
            </a>
          </li>
        </ul>
      </div>
      <p>Connect with me on these platforms</p>
    </footer>
  )
}

export default Footer
