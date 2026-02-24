import * as React from "react"
import { Link, HeadFC } from 'gatsby'
// @ts-ignore
import { navbarMargin, textCenter, hiddenButton } from '../components/global.module.css'
import { StaticImage } from 'gatsby-plugin-image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Layout from '../components/layout'
import Seo from '../components/seo'
import TravelMap from '../components/travel-map'
// @ts-ignore
import * as styles from '../components/index.module.css'
import scrollTo from 'gatsby-plugin-smoothscroll'
import { motion } from 'framer-motion'

interface SectionProps {
  children: React.ReactNode
  delay?: number
}

const Section = ({ children, delay = 0 }: SectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
)

const IndexPage = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel is NOT intersecting, it means we've scrolled down
        if (entry) {
          setScrolled(!entry.isIntersecting);
        }
      },
      { threshold: [0], rootMargin: "-50px 0px 0px 0px" }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    const currentSentinel = sentinelRef.current;

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, []);

  const handleSpaceScroll = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      scrollTo('#main');
    }
  }
  
  return (
    <Layout darkNavbar={scrolled}>
      <div ref={sentinelRef} style={{ position: "absolute", top: 0, height: "1px", width: "1px" }} aria-hidden="true" />
      <div style={{display: "grid"}}>
        <StaticImage
          className={styles.backgroundImage}
          layout="fullWidth"
          alt=""
          src="../images/glacier-min.jpg"
          placeholder="blurred"
        />
        <div className={styles.coverContent}>
          <header className={styles.header}>
            <h1 className={`${styles.headerText} ${styles.headerTitle}`} id="header-title">Dongjoon Lee</h1>
            <p className={styles.headerText}>Welcome to my website!</p>
            <button className={`${styles.down} ${hiddenButton}`} aria-label="Scroll Down" onClick={() => {scrollTo('#main')}} onKeyDown={(e) => {handleSpaceScroll(e)}}>
              <span id="down" className={`${styles.headerText} `}><FontAwesomeIcon icon="arrow-down" size="lg"/></span>
            </button>
          </header>
        </div>
      </div>
      <main id="main" className={navbarMargin}>
        <div className={styles.mainAbout}>
          <Section>
            <div className={styles.flexRow}>
              <div className={styles.twoColumn}>
                <StaticImage className={styles.fullWidth} src="../images/Columns.jpeg" alt="Dongjoon"/>
              </div>
              <div className={styles.twoColumn}>
                <h1>About Me</h1>
                <p className={styles.bioText}>
                  Hi I'm Dongjoon! I was born in Seoul, Korea and moved to
                  Southern California in the fourth grade. 
                  I graduated with a Master's degree from the MIT 
                  Aeronautics and Astronautics department in the summer of 2023, where I worked on 
                  aircraft design and optimization. You can find my Master's thesis <a className={styles.embeddedAnchor} href="https://dspace.mit.edu/handle/1721.1/151601">here</a>.
                </p>
                <p className={styles.bioText}>
                  Since graduation, I've been working as a Software Developer at MathWorks, 
                  specifically on the Aerospace Toolbox and Aerospace Blockset product.
                </p>
                <p className={styles.bioText}>
                  Personally, I enjoy snowboarding, playing music,
                  and trying new foods. This website is an ongoing catalog
                  of things from my life.
                </p>
              </div>
            </div>
          </Section>
          <div className={textCenter} role="separator">
            <StaticImage className={styles.hrSvg} src="../images/hr.svg" aria-hidden="true" alt="divider"/>
          </div>
          <Section>
            <div className={styles.flexRow}>
              <div className={styles.twoColumn}>
                <h1>Snowboarding</h1>
                <p className={styles.bioText}>
                  I've been trying to learn various tricks on snowboard the
                  past couple seasons. I've been posting progression videos on
                  a private&nbsp;
                  <a className={styles.embeddedAnchor} href="https://www.instagram.com/noondongjoon">
                    instagram
                  </a> page. Next season, I want to land 360s with grabs.
                </p>
              </div>
              <div className={styles.twoColumn}>
                <StaticImage className={styles.fullWidth} src="../images/snowboarding.jpg" alt="snowboarding"/>
              </div>
            </div>
          </Section>
          <div className={textCenter} role="separator">
            <StaticImage className={styles.hrSvg} src="../images/hr.svg" aria-hidden="true" alt="divider"/>
          </div>
          <Section>
            <div className={styles.flexRow}>
              <div className={styles.twoColumn}>
                <figure>
                  <TravelMap />
                </figure>
              </div>
              <div className={styles.twoColumn}>
                <h1>Travel</h1>
                <p className={styles.bioText}>
                  I enjoy visiting new places. The <Link className={styles.embeddedAnchor} to="/gallery">gallery</Link> page 
                  on this site showcases a lot of the pictures I've taken on recent travels.
                </p>
              </div>
            </div>
          </Section>
        </div>
      </main>
    </Layout>
  )
}

export const Head: HeadFC = () => <Seo />

export default IndexPage
