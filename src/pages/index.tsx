import * as React from "react"
import { Link, type HeadFC, useStaticQuery, graphql } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Layout from '../components/animated-layout'
import Seo from '../components/seo'
import * as styles from '../components/index.module.css'
import TravelMapWhenVisible from '../components/travel-map-when-visible'
import josefinSans700 from '@fontsource/josefin-sans/files/josefin-sans-latin-700-normal.woff2'

const HeroScene = React.lazy(() => import('../components/hero-scene'))
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../utils/motion-variants'
import { DESKTOP_HERO_QUERY } from '../styles/breakpoints'
import { useMatchMedia } from '../hooks/use-match-media'

const homeFade = fadeInUp({ y: 30, duration: 0.6 })
const homeStagger = staggerContainer(0.2)

type HomeHeroChromeProps = {
  enterInitial: false | "hidden"
  reducedMotion: boolean
}

const HomeHeroChrome: React.FC<HomeHeroChromeProps> = ({
  enterInitial,
  reducedMotion,
}) => (
  <>
    <m.div
      className={styles.heroContent}
      initial={enterInitial}
      animate="visible"
      variants={homeStagger}
    >
      <m.h1 className={styles.heroTitle} variants={homeFade}>
        DONGJOON<br/>LEE
      </m.h1>

      <m.div className={styles.heroSubtitle} variants={homeFade}>
        <span>Software Engineer.</span>
        <span>Aerospace Background.</span>
        <span>Based in Boston.</span>
      </m.div>
    </m.div>

    <m.button
      className={styles.scrollIndicator}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { delay: 1, duration: 1 }}
      onClick={() => document.getElementById('about')?.scrollIntoView()}
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      aria-label="Scroll to About Section"
    >
      <span>SCROLL TO EXPLORE</span>
      <FontAwesomeIcon icon={['fas', 'arrow-down']} />
    </m.button>
  </>
)

// Lightweight aerospace-flavored decorative visual shown in place of the
// Three.js scene below the desktop breakpoint. CSS (not JS) decides
// visibility (`@media (min-width: 901px)` hides it) so it renders identically
// from HomeHeroStatic and HomeHeroAnimated without needing isDesktop there.
const HeroMobileVisual: React.FC = () => (
  <div className={styles.heroMobileVisual} aria-hidden="true">
    <svg
      className={styles.heroMobileVisualSvg}
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      <path
        className={styles.heroMobileVisualArc}
        d="M 40 260 Q 200 180 360 260"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        className={styles.heroMobileVisualArc}
        d="M 70 300 Q 200 240 330 300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <g className={styles.heroMobileVisualPlane}>
        <path
          d="M200 120 L206 150 L246 174 L246 182 L206 172 L206 196 L222 208 L222 214 L200 208 L178 214 L178 208 L194 196 L194 172 L154 182 L154 174 L194 150 Z"
          fill="currentColor"
        />
      </g>
    </svg>
  </div>
)

const HomeHeroAnimated: React.FC = () => {
  // Gate the lazy Three.js child only — keep chrome mounted across breakpoint
  // crossings so scroll motion / entrance state are not remounted.
  const isDesktop = useMatchMedia(DESKTOP_HERO_QUERY)
  const [idleReady, setIdleReady] = React.useState(false)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95])
  const heroY = useTransform(scrollY, [0, 300], [0, 50])
  const scrollProgress = useTransform(scrollY, [0, 300], [0, 1])

  React.useEffect(() => {
    if (!isDesktop) {
      setIdleReady(false)
      return
    }

    let cancelled = false
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    // Short timeout: yield once after paint without waiting up to 2s on a busy main thread.
    const IDLE_TIMEOUT_MS = 150

    const onIdle = () => {
      if (!cancelled) setIdleReady(true)
    }

    if (typeof requestIdleCallback !== 'undefined') {
      idleId = requestIdleCallback(onIdle, { timeout: IDLE_TIMEOUT_MS })
    } else {
      timeoutId = setTimeout(onIdle, IDLE_TIMEOUT_MS)
    }

    return () => {
      cancelled = true
      if (idleId !== undefined && typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
    }
  }, [isDesktop])

  return (
    <m.header
      className={styles.heroContainer}
      style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
    >
      <div className={styles.hero3dWrapper}>
        <HeroMobileVisual />
        {isDesktop && idleReady ? (
          <React.Suspense fallback={null}>
            <HeroScene scrollProgress={scrollProgress} />
          </React.Suspense>
        ) : null}
      </div>
      <HomeHeroChrome enterInitial="hidden" reducedMotion={false} />
    </m.header>
  )
}

const HomeHeroStatic: React.FC = () => (
  <m.header className={styles.heroContainer}>
    <div className={styles.hero3dWrapper}>
      <HeroMobileVisual />
    </div>
    <HomeHeroChrome enterInitial={false} reducedMotion />
  </m.header>
)

const IndexPageContent = () => {
  const prefersReducedMotion = useReducedMotion();
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  // SSR + first client paint both use Static (avoids hydration mismatch).
  // Animated chrome mounts whenever motion is allowed; Three.js still only
  // loads when HomeHeroAnimated renders <HeroScene/> behind isDesktop.
  const showAnimatedHero = hydrated && prefersReducedMotion === false;
  const enterInitial = prefersReducedMotion === true ? false : "hidden";

  // Keep useStaticQuery inside Layout so QueryErrorBoundary can catch failures.
  const data = useStaticQuery<Queries.IndexPageCloudinaryQuery>(graphql`
    query IndexPageCloudinary {
      columnsImg: cloudinaryMedia(secure_url: {regex: "/Columns/"}) {
        gatsbyImageData(width: 400, placeholder: BLURRED, layout: CONSTRAINED)
      }
      snowboardingImg: cloudinaryMedia(secure_url: {regex: "/snowboarding/"}) {
        gatsbyImageData(width: 600, placeholder: BLURRED, layout: CONSTRAINED)
      }
      climbingImg: cloudinaryMedia(secure_url: {regex: "/climb1/"}) {
        gatsbyImageData(width: 600, placeholder: BLURRED, layout: CONSTRAINED)
      }
    }
  `);

  const columnsImage = getImage(data?.columnsImg?.gatsbyImageData ?? null);
  const snowboardingImage = getImage(data?.snowboardingImg?.gatsbyImageData ?? null);
  const climbingImage = getImage(data?.climbingImg?.gatsbyImageData ?? null);

  return (
      <main id="main">
      {/* 1. Hero Section */}
      {showAnimatedHero ? <HomeHeroAnimated /> : <HomeHeroStatic />}

      {/* 2. About Section */}
      <m.section 
        id="about"
        className={styles.section}
        initial={enterInitial}
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={homeStagger}
      >
        <h2 className={styles.sectionTitle}>01 / About Me</h2>
        
        <div className={styles.aboutGrid}>
          <m.div className={styles.aboutText} variants={homeFade}>
            <p>
              Hi, I'm Dongjoon! I was born in <span className={styles.highlight}>Seoul, Korea</span> and moved 
              to <span className={styles.highlight}>Southern California</span> in the fourth grade.
            </p>
            <p>
              I graduated with a Master's degree from <span className={styles.highlight}>MIT AeroAstro</span> in 2023, 
              where I researched <span className={styles.highlight}>aircraft design optimization</span>. 
              You can find <a href="https://dspace.mit.edu/handle/1721.1/151601" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>my MIT thesis</a>.
            </p>
            <p>
              Currently, I work as a Software Developer at <span className={styles.highlight}>MathWorks</span> on 
              the Aerospace Toolbox and Aerospace Blockset products.
            </p>
            <p>
              Personally, I enjoy <span className={styles.highlight}>snowboarding</span>, <span className={styles.highlight}>climbing</span>, playing music,
              and trying new foods. This website is an ongoing catalog of things from my life.
            </p>
          </m.div>

          <m.div className={styles.portraitContainer} variants={homeFade}>
            {columnsImage ? (
              <GatsbyImage 
                image={columnsImage} 
                alt="Dongjoon Portrait" 
                className={styles.portraitImg}
              />
            ) : (
              <div style={{width: 400, height: 400, background: '#333', borderRadius: '12px'}} />
            )}
          </m.div>
        </div>
      </m.section>

      {/* 3. Hobbies / Featured Section */}
      <m.section 
        className={styles.section}
        initial={enterInitial}
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={homeStagger}
      >
        <h2 className={styles.sectionTitle}>02 / Hobbies</h2>
        
        <div className={styles.hobbyGrid}>
          {/* Card 1: Snowboarding */}
          <Link to="/gallery" className={styles.hobbyCard}>
            {snowboardingImage ? (
              <GatsbyImage 
                image={snowboardingImage} 
                alt="Snowboarding" 
                style={{ height: '100%' }}
              />
            ) : (
              <div style={{width: '100%', height: '100%', background: '#333'}} />
            )}
            <div className={styles.cardOverlay}>
              <h3 className={styles.cardTitle}>Snowboarding</h3>
              <p className={styles.cardText}>Chasing powder & progression.</p>
            </div>
          </Link>

          {/* Card 2: Climbing */}
          <Link to="/gallery" className={styles.hobbyCard}>
            {climbingImage ? (
              <GatsbyImage 
                image={climbingImage} 
                alt="Climbing" 
                style={{ height: '100%' }}
              />
            ) : (
              <div style={{width: '100%', height: '100%', background: '#333'}} />
            )}
             <div className={styles.cardOverlay}>
              <h3 className={styles.cardTitle}>Climbing</h3>
              <p className={styles.cardText}>Bouldering & Lead.</p>
            </div>
          </Link>
        </div>
      </m.section>

      {/* 4. Travel Section */}
      <m.section 
        id="travel-map"
        className={styles.section}
        initial={enterInitial}
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={homeStagger}
      >
        <h2 className={styles.sectionTitle}>03 / Travel</h2>
        
        <div className={styles.aboutText} style={{marginBottom: '30px'}}>
          <p>
            I enjoy visiting new places. Check out the <Link to="/gallery" style={{ color: 'var(--color-accent)' }}>Gallery</Link> for photos from my trips.
          </p>
        </div>

        <m.div className={styles.mapContainer} variants={homeFade}>
          <TravelMapWhenVisible />
        </m.div>
      </m.section>

      </main>
  )
}

const IndexPage = () => (
  <Layout>
    <IndexPageContent />
  </Layout>
)

export const Head: HeadFC = ({ location }) => (
  <Seo pathname={location.pathname}>
    <link
      rel="preload"
      href={josefinSans700}
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
  </Seo>
)

export default IndexPage
