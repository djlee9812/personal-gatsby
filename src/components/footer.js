import * as React from 'react'
import { FaGithub } from '@react-icons/all-files/fa/FaGithub'
import { FaInstagram } from '@react-icons/all-files/fa/FaInstagram'
import { FaLinkedin } from '@react-icons/all-files/fa/FaLinkedin'
import { FaGoodreads } from '@react-icons/all-files/fa/FaGoodreads'
import { links, footerDiv } from './footer.module.css'

const Footer = () => {
  return (
    <footer className={footerDiv}>
      <p>Made by Dongjoon Lee</p>
      <div id="links-div">
        <ul className={links}>
          <li>
            <a href="https://www.github.com/djlee9812/">
              {/* <i class="fa-brands fa-github"></i> */}
              <FaGithub />
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/djlee9812/">
              {/* <i class="fa-brands fa-instagram"></i> */}
              <FaInstagram />
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/dongjoon-lee/">
              {/* <i class="fa-brands fa-linkedin"></i> */}
              <FaLinkedin />
            </a>
          </li>
          <li>
            <a href="https://www.goodreads.com/dongjoonlee/">
              {/* <i class="fa-brands fa-goodreads"></i> */}
              <FaGoodreads />
            </a>
          </li>
        </ul>
      </div>
      <p>Connect with me on these platforms</p>
    </footer>
  )
}

export default Footer