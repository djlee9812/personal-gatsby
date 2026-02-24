import * as React from "react"
import { Link, HeadFC } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Layout from '../components/layout'
import Seo from '../components/seo'
import TravelMap from '../components/travel-map'
import * as styles from '../components/index.module.css'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import scrollTo from 'gatsby-plugin-smoothscroll'

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const IndexPage = () => {
  const { scrollY } = useScroll();
  
  // Transform scrollY to opacity: 1 at 0px, 0 at 300px
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const heroY = useTransform(scrollY, [0, 300], [0, 50]);

  return (
    <Layout>
      {/* 1. Hero Section */}
      <motion.header 
        className={styles.heroContainer}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 className={styles.heroTitle} variants={fadeInUp}>
            DONGJOON<br/>LEE
          </motion.h1>
          
          <motion.div className={styles.heroSubtitle} variants={fadeInUp}>
            <span>Software Engineer.</span>
            <span>Aerospace Background.</span>
            <span>Based in Boston.</span>
          </motion.div>
        </motion.div>

        <motion.button 
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          onClick={() => scrollTo('#about')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Scroll to About Section"
        >
          <span>SCROLL TO EXPLORE</span>
          <FontAwesomeIcon icon="arrow-down" />
        </motion.button>
      </motion.header>

      {/* 2. About Section */}
      <motion.section 
        id="about"
        className={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className={styles.sectionTitle}>01 / About Me</div>
        
        <div className={styles.aboutGrid}>
          <motion.div className={styles.aboutText} variants={fadeInUp}>
            <p>
              Hi, I'm Dongjoon! I was born in <span className={styles.highlight}>Seoul, Korea</span> and moved 
              to <span className={styles.highlight}>Southern California</span> in the fourth grade.
            </p>
            <p>
              I graduated with a Master's degree from <span className={styles.highlight}>MIT AeroAstro</span> in 2023, 
              where I researched <span className={styles.highlight}>aircraft design optimization</span>. 
              You can find my thesis <a href="https://dspace.mit.edu/handle/1721.1/151601" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>here</a>.
            </p>
            <p>
              Currently, I work as a Software Developer at <span className={styles.highlight}>MathWorks</span> on 
              the Aerospace Toolbox and Aerospace Blockset products.
            </p>
            <p>
              Personally, I enjoy <span className={styles.highlight}>snowboarding</span>, <span className={styles.highlight}>climbing</span>, playing music,
              and trying new foods. This website is an ongoing catalog of things from my life.
            </p>
          </motion.div>

          <motion.div className={styles.portraitContainer} variants={fadeInUp}>
            <StaticImage 
              src="../images/Columns.jpeg" 
              alt="Dongjoon Portrait" 
              className={styles.portraitImg}
              width={400}
              quality={95}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* 3. Hobbies / Featured Section */}
      <motion.section 
        className={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className={styles.sectionTitle}>02 / Hobbies</div>
        
        <div className={styles.hobbyGrid}>
          {/* Card 1: Snowboarding */}
          <Link to="/gallery" className={styles.hobbyCard}>
            <StaticImage 
              src="../images/snowboarding.jpg" 
              alt="Snowboarding" 
              style={{ height: '100%' }}
            />
            <div className={styles.cardOverlay}>
              <h3 className={styles.cardTitle}>Snowboarding</h3>
              <p className={styles.cardText}>Chasing powder & progression.</p>
            </div>
          </Link>

          {/* Card 2: Climbing */}
          <Link to="/gallery" className={styles.hobbyCard}>
            <StaticImage 
              src="../images/hobby/climb1.jpg" 
              alt="Climbing" 
              style={{ height: '100%' }}
            />
             <div className={styles.cardOverlay}>
              <h3 className={styles.cardTitle}>Climbing</h3>
              <p className={styles.cardText}>Bouldering & Lead.</p>
            </div>
          </Link>
        </div>
      </motion.section>

      {/* 4. Travel Section */}
      <motion.section 
        className={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className={styles.sectionTitle}>03 / Travel</div>
        
        <div className={styles.aboutText} style={{marginBottom: '30px'}}>
          <p>
            I enjoy visiting new places. Check out the <Link to="/gallery" style={{ color: 'var(--color-accent)' }}>Gallery</Link> for photos from my trips.
          </p>
        </div>

        <motion.div className={styles.mapContainer} variants={fadeInUp}>
          <TravelMap />
        </motion.div>
      </motion.section>

    </Layout>
  )
}

export const Head: HeadFC = () => <Seo />

export default IndexPage
