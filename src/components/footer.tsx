
import * as styles from './footer.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'

const SOCIAL_LINKS: ReadonlyArray<{ href: string; label: string; icon: IconProp }> = [
  { href: 'https://www.github.com/djlee9812/', label: 'GitHub', icon: ['fab', 'github'] },
  { href: 'https://www.instagram.com/djlee9812/', label: 'Instagram', icon: ['fab', 'instagram'] },
  { href: 'https://www.linkedin.com/in/dongjoon-lee/', label: 'LinkedIn', icon: ['fab', 'linkedin'] },
  { href: 'https://www.goodreads.com/dongjoonlee/', label: 'Goodreads', icon: ['fab', 'goodreads'] },
]

const Footer = () => {
  return (
    <footer className={styles.footerDiv}>
      <p>Made by Dongjoon Lee</p>
      <div id="links-div">
        <ul className={styles.links}>
          {SOCIAL_LINKS.map(({ href, label, icon }) => (
            <li key={href}>
              <a
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={icon} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p>Connect with me on these platforms</p>
    </footer>
  )
}

export default Footer
