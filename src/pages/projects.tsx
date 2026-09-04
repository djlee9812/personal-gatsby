
import type { HeadFC } from "gatsby"
import { m } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as globalStyles from "../components/global.module.css"
import * as styles from "../components/projects.module.css"
import Layout from "../components/animated-layout"
import Seo from "../components/seo"
import { projects } from "../data/projects"
import type { Project } from "../data/projects"
import { optimizeCloudinaryImage } from "../utils/cloudinary"
import { fadeInUp, staggerContainer } from "../utils/motion-variants"
import { SIZES_BELOW_PAGE } from "../styles/breakpoints"
import { useAllowMotion } from "../hooks/use-allow-motion"

const projectFade = fadeInUp({ y: 24, duration: 0.4 })
const projectStagger = staggerContainer(0.1)

const PROJECT_IMAGE_SIZES = `${SIZES_BELOW_PAGE} 100vw, 480px`

/** Static project data — precompute delivery URLs once at module load. */
const projectImages = new Map(
  projects.map((project) => [
    project.title,
    project.imagePath
      ? optimizeCloudinaryImage(project.imagePath, {
          width: 480,
          widths: [480, 800],
          sizes: PROJECT_IMAGE_SIZES,
        })
      : null,
  ])
)

function ProjectCard({ project }: { project: Project }) {
  const image = projectImages.get(project.title) ?? null

  return (
    <m.article
      className={styles.card}
      variants={projectFade}
    >
      {image && (
        <div
          className={
            project.imageFit === "contain"
              ? `${styles.cardImageWrap} ${styles.cardImageWrapContain}`
              : styles.cardImageWrap
          }
        >
          <img
            src={image.src}
            {...(image.srcSet ? { srcSet: image.srcSet } : {})}
            {...(image.sizes ? { sizes: image.sizes } : {})}
            alt={`${project.title} screenshot`}
            loading="lazy"
          />
        </div>
      )}
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{project.title}</h2>
        <p className={styles.cardDescription}>{project.description}</p>
        <ul className={styles.techList} aria-label="Tech stack">
          {project.techStack.map((tech) => (
            <li key={tech} className={styles.techTag}>
              {tech}
            </li>
          ))}
        </ul>
        <div className={styles.cardLinks}>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
            >
              <FontAwesomeIcon icon={['fab', 'github']} /> View on GitHub
            </a>
          )}
          {project.appStoreUrl && (
            <a
              href={project.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download on the App Store"
            >
              <FontAwesomeIcon icon={['fab', 'apple']} /> App Store
            </a>
          )}
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Try it live"
            >
              Try it
            </a>
          )}
        </div>
      </div>
    </m.article>
  )
}

const Projects = () => {
  const { enterInitial } = useAllowMotion()

  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        <section className={styles.section}>
          <div className={`${globalStyles.pageHeader} ${globalStyles.pageHeaderTop} ${globalStyles.textCenter}`}>
            <h1>Projects</h1>
            <p>A few things I've built: simulations, tools, and side projects.</p>
          </div>
          <div className={globalStyles.container}>
            <m.div
              className={styles.cardGrid}
              variants={projectStagger}
              initial={enterInitial}
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {projects.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </m.div>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export const Head: HeadFC = ({ location }) => (
  <Seo title="Projects" pathname={location.pathname} />
)

export default Projects
