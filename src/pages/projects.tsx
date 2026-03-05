import * as React from "react"
import { HeadFC } from "gatsby"
import { motion, Variants } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "../utils/fontawesome"
import * as globalStyles from "../components/global.module.css"
import * as styles from "../components/projects.module.css"
import Layout from "../components/layout"
import Seo from "../components/seo"
import { projects } from "../data/projects"
import type { Project } from "../data/projects"

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      className={styles.card}
      variants={fadeInUp}
    >
      {project.imagePath && (
        <div className={styles.cardImageWrap}>
          <img
            src={project.imagePath}
            alt=""
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
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
          >
            <FontAwesomeIcon icon={faGithub} /> View on GitHub
          </a>
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
    </motion.article>
  )
}

const Projects = () => {
  return (
    <Layout>
      <main className={globalStyles.navbarMargin}>
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <div className={`${globalStyles.pageHeader} ${globalStyles.pageHeaderTop} ${globalStyles.textCenter}`}>
            <h1>Projects</h1>
            <p>A few things I've built: simulations, tools, and side projects.</p>
          </div>
          <div className={globalStyles.container}>
            <motion.div
              className={styles.cardGrid}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {projects.map((project) => (
                <ProjectCard key={project.githubUrl} project={project} />
              ))}
            </motion.div>
          </div>
        </motion.section>
      </main>
    </Layout>
  )
}

export const Head: HeadFC = () => <Seo title="Projects" />

export default Projects
