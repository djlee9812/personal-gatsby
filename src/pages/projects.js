import * as React from "react"
import Layout from '../components/layout'
import { container, textCenter, navbarMargin, marginSm } from '../components/global.module.css'

const Projects = () => {

  return (
    <Layout pageTitle="Dongjoon Lee | Projects" darkNavbar={true}>
      <main className={navbarMargin}>
        <div className={`${container} ${textCenter}`}>
          <h1 className={marginSm}>Projects</h1>
          <p className={marginSm}>Here is a compilation of recent projects</p>
        </div>
      </main>
    </Layout>
  )
}

export default Projects
