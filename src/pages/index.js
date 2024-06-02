import * as React from "react"
import { Link } from 'gatsby'
import { navbarMargin, textCenter, hiddenButton } from '../components/global.module.css'
import { StaticImage } from 'gatsby-plugin-image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Layout from '../components/layout'
import Seo from '../components/seo'
import * as styles from '../components/index.module.css'
import scrollTo from 'gatsby-plugin-smoothscroll'

const IndexPage = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.pageYOffset > 50)
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    }
  }, []);

  const handleSpaceScroll = (e) => {
    console.log(e)
    if (e.key === 'Enter') {

      scrollTo('#main');
    }
  }
  
  return (
    <Layout darkNavbar={scrolled}>
      <div style={{display: "grid"}}>
        <StaticImage
          className={styles.backgroundImage}
          layout="fullWidth"
          alt=""
          src="../images/glacier.jpg"
          placeholder="blurred"
        />
        <div className={styles.coverContent}>
          <header className={styles.header}>
            <h1 className={`${styles.headerText} ${styles.headerTitle}`} id="header-title">Dongjoon Lee</h1>
            <p className={styles.headerText}>Welcome to my website!</p>
            <button className={`${styles.down} ${hiddenButton}`} aria-label="Scroll Down" onClick={() => {scrollTo('#main')}} onKeyDown={(e) => {handleSpaceScroll(e)}}>
              <span id="down" className={`${styles.headerText} `}><FontAwesomeIcon icon="arrow-down" size={30}/></span>
            </button>
          </header>
        </div>
      </div>
      <main id="main" className={navbarMargin}>
        <div className={styles.mainAbout}>
          <div className={styles.flexRow}>
            <div className={styles.twoColumn}>
              <StaticImage className={styles.fullWidth} src="../images/Columns.jpeg" alt="Dongjoon"/>
            </div>
            <div className={styles.twoColumn}>
              <h1>About Me</h1>
              <p className={styles.bioText}>
                Hi I'm Dongjoon! I was born in Seoul, Korea and moved to
                Southern California in the fourth grade. 
                I am now a graduate student at the MIT 
                Aeronautics and Astronautics department, working on 
                aircraft design and optimization. I will be graduating
                with my Masters of Science in May 2023.
              </p>
              <p className={styles.bioText}>
                Personally, I enjoy snowboarding, playing music,
                and trying new foods. This website is an ongoing catalog
                of things from my life.
              </p>
            </div>
          </div>
          <div className={textCenter} role="separator">
            <StaticImage className={styles.hrSvg} src="../images/hr.svg" aria-hidden="true" focusable="false" alt="divider"/>
          </div>
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
          <div className={textCenter} role="separator">
            <StaticImage className={styles.hrSvg} src="../images/hr.svg" aria-hidden="true" focusable="false" alt="divider"/>
          </div>
          <div className={styles.flexRow}>
            <div className={styles.twoColumn}>
              <figure>
                <StaticImage className={`${styles.fullWidth} ${styles.mapImg}`} src="../images/map.png" alt="travel map"/>
                <figcaption><span>Source: Amcharts</span></figcaption>
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
        </div>
      </main>
    </Layout>
  )
}

export const Head = () => <Seo />

export default IndexPage
