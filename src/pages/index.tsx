import * as React from "react"
import { Link, type HeadFC, useStaticQuery, graphql } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Layout from '../components/animated-layout'
import { IslandErrorBoundary } from '../components/island-error-boundary'
import Seo from '../components/seo'
import * as styles from '../components/index.module.css'
import TravelMapWhenVisible from '../components/travel-map-when-visible'
import josefinSans700 from '@fontsource/josefin-sans/files/josefin-sans-latin-700-normal.woff2'

const HeroScene = React.lazy(
  () => import(/* webpackChunkName: "hero-scene" */ '../components/hero-scene'),
)
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import {
  aboutBriefingContainer,
  aboutPortraitLand,
  aboutTextReveal,
  aboutTitleFade,
  hobbyOverlayFade,
  softInView,
} from '../utils/motion-variants'
import { HERO_INTRO_DURATION_S } from '../utils/hero-timing'
import { DESKTOP_HERO_QUERY } from '../styles/breakpoints'
import { useMatchMedia } from '../hooks/use-match-media'

const HOME_IN_VIEW_VIEWPORT = { once: true, margin: "-100px" } as const
/** Softer margin so short overlay nodes still intersect on tight viewports. */
const OVERLAY_IN_VIEW_VIEWPORT = { once: true, margin: "-40px" } as const

const hobbyOverlay = hobbyOverlayFade()
const hobbyOverlayDelayed = hobbyOverlayFade(0.12)

const heroIntroStyle = {
  ["--hero-intro-s" as string]: `${HERO_INTRO_DURATION_S}s`,
}

const HomeHeroChrome: React.FC = () => (
  <>
    <div className={styles.heroContent}>
      {/* Attitude Hold: title is always present — plane leads the scene */}
      <h1 className={styles.heroTitle}>
        DONGJOON<br/>LEE
      </h1>

      <div className={styles.heroSubtitle}>
        <span>Software Engineer.</span>
        <span>Aerospace Background.</span>
        <span>Based in Boston.</span>
      </div>
    </div>

    <button
      type="button"
      className={styles.scrollIndicator}
      onClick={() => document.getElementById('about')?.scrollIntoView()}
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      aria-label="Scroll to About Section"
    >
      <span>SCROLL TO EXPLORE</span>
      <FontAwesomeIcon
        icon={['fas', 'arrow-down']}
        className={styles.scrollIndicatorIcon}
      />
    </button>
  </>
)

// Lightweight aerospace-flavored decorative visual shown in place of the
// Three.js scene below the desktop breakpoint. CSS (not JS) decides
// visibility (`@media (min-width: 901px)` hides it).
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

type HomeHeroProps = {
  allowMotion: boolean
}

/** Single header so HeroMobileVisual and chrome are not remounted when motion unlocks after hydrate. */
const HomeHero: React.FC<HomeHeroProps> = ({ allowMotion }) => {
  const isDesktop = useMatchMedia(DESKTOP_HERO_QUERY)
  const [idleReady, setIdleReady] = React.useState(false)
  const { scrollY } = useScroll()
  // Plane attitude only — header chrome stays fully opaque (Attitude Hold).
  const scrollProgress = useTransform(scrollY, [0, 300], [0, 1])

  React.useEffect(() => {
    if (!allowMotion || !isDesktop) {
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
  }, [allowMotion, isDesktop])

  return (
    <header className={styles.heroContainer} style={heroIntroStyle}>
      <div className={styles.hero3dWrapper}>
        <HeroMobileVisual />
        {allowMotion && isDesktop && idleReady ? (
          <IslandErrorBoundary
            fallback={
              <div className={styles.heroSceneFailed} aria-hidden="true" />
            }
          >
            <React.Suspense fallback={null}>
              <HeroScene scrollProgress={scrollProgress} />
            </React.Suspense>
          </IslandErrorBoundary>
        ) : null}
      </div>
      <HomeHeroChrome />
    </header>
  )
}

const IndexPageContent = () => {
  const prefersReducedMotion = useReducedMotion();
  const [hydrated, setHydrated] = React.useState(false);
  const aboutTitleRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  // SSR + first client paint both keep allowMotion false (avoids hydration mismatch).
  const allowMotion = hydrated && prefersReducedMotion === false;
  const enterInitial = prefersReducedMotion === true ? false : "hidden";
  const inViewProps = {
    initial: enterInitial as false | "hidden",
    whileInView: "visible" as const,
    viewport: HOME_IN_VIEW_VIEWPORT,
  };
  const overlayInViewProps = {
    initial: enterInitial as false | "hidden",
    whileInView: "visible" as const,
    viewport: OVERLAY_IN_VIEW_VIEWPORT,
  };

  // Keep useStaticQuery inside Layout so QueryErrorBoundary can catch failures.
  const data = useStaticQuery<Queries.IndexPageCloudinaryQuery>(graphql`
    query IndexPageCloudinary {
      columnsImg: cloudinaryMedia(public_id: {eq: "src/images/Columns"}) {
        gatsbyImageData(width: 400, placeholder: BLURRED, layout: CONSTRAINED)
      }
      snowboardingImg: cloudinaryMedia(public_id: {eq: "src/images/snowboarding"}) {
        gatsbyImageData(width: 600, placeholder: BLURRED, layout: CONSTRAINED)
      }
      climbingImg: cloudinaryMedia(public_id: {eq: "src/images/hobby/climb1"}) {
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
      <HomeHero allowMotion={allowMotion} />

      {/* 2. About — Asymmetric Briefing (alt altitude band) */}
      <section id="about" className={styles.bandAlt} aria-labelledby="about-heading">
        <m.div
          className={styles.section}
          {...inViewProps}
          variants={aboutBriefingContainer}
          onViewportEnter={() => {
            aboutTitleRef.current?.classList.add(styles.sectionTitleBriefing)
          }}
        >
          <m.h2
            id="about-heading"
            ref={aboutTitleRef}
            className={styles.sectionTitle}
            variants={aboutTitleFade}
          >
            01 / About Me
          </m.h2>

          <div className={styles.aboutGrid}>
            <m.div className={styles.aboutText} variants={aboutTextReveal}>
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

            <m.div className={styles.portraitContainer} variants={aboutPortraitLand}>
              {columnsImage ? (
                <GatsbyImage
                  image={columnsImage}
                  alt="Dongjoon Portrait"
                  className={styles.portraitImg}
                />
              ) : (
                <div style={{width: 400, height: 400, background: 'var(--color-border)', borderRadius: 'var(--radius-lg)'}} />
              )}
            </m.div>
          </div>
        </m.div>
      </section>

      {/* 3. Hobbies — overlay telemetry only (primary plane) */}
      <section className={styles.band} aria-labelledby="hobbies-heading">
        <div className={styles.section}>
          <m.h2
            id="hobbies-heading"
            className={styles.sectionTitle}
            {...inViewProps}
            variants={softInView}
          >
            02 / Hobbies
          </m.h2>

          <div className={styles.hobbyGrid}>
            <Link to="/gallery" className={styles.hobbyCard}>
              {snowboardingImage ? (
                <GatsbyImage
                  image={snowboardingImage}
                  alt="Snowboarding"
                  style={{ height: '100%' }}
                />
              ) : (
                <div style={{width: '100%', height: '100%', background: 'var(--color-border)'}} />
              )}
              <m.div
                className={styles.cardOverlay}
                {...overlayInViewProps}
                variants={hobbyOverlay}
              >
                <h3 className={styles.cardTitle}>Snowboarding</h3>
                <p className={styles.cardText}>Chasing powder & progression.</p>
              </m.div>
            </Link>

            <Link to="/gallery" className={styles.hobbyCard}>
              {climbingImage ? (
                <GatsbyImage
                  image={climbingImage}
                  alt="Climbing"
                  style={{ height: '100%' }}
                />
              ) : (
                <div style={{width: '100%', height: '100%', background: 'var(--color-border)'}} />
              )}
              <m.div
                className={styles.cardOverlay}
                {...overlayInViewProps}
                variants={hobbyOverlayDelayed}
              >
                <h3 className={styles.cardTitle}>Climbing</h3>
                <p className={styles.cardText}>Bouldering & Lead.</p>
              </m.div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Travel — copy only; map shell static (alt altitude band) */}
      <section id="travel-map" className={styles.bandAlt} aria-labelledby="travel-heading">
        <div className={styles.section}>
          <m.h2
            id="travel-heading"
            className={styles.sectionTitle}
            {...inViewProps}
            variants={softInView}
          >
            03 / Travel
          </m.h2>

          <m.div
            className={styles.aboutText}
            style={{ marginBottom: '30px' }}
            {...inViewProps}
            variants={softInView}
          >
            <p>
              I enjoy visiting new places. Check out the <Link to="/gallery" style={{ color: 'var(--color-accent)' }}>Gallery</Link> for photos from my trips.
            </p>
          </m.div>

          <div className={styles.mapContainer}>
            <TravelMapWhenVisible />
          </div>
        </div>
      </section>

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
