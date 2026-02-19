import * as React from "react"
import { container, textCenter, navbarMargin, marginSm } from '../components/global.module.css'
import Layout from '../components/layout'
import Seo from '../components/seo'

const Projects = () => {

  return (
    <Layout darkNavbar={true}>
      <main className={navbarMargin}>
        <div className={`${container} ${textCenter}`}>
          <h1 className={marginSm}>Projects</h1>
          <p className={marginSm}>Here is a compilation of recent projects</p>
        </div>
      </main>
    </Layout>
  )
}

export const Head = () => <Seo title="Projects" />

export default Projects
