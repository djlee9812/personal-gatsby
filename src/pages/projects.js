import * as React from "react"
import * as globalStyles from '../components/global.module.css'
import Layout from '../components/layout'
import Seo from '../components/seo'

const Projects = () => {

  return (
    <Layout>
      <main className={globalStyles.navbarMargin}>
        <div className={`${globalStyles.container} ${globalStyles.textCenter}`}>
          <h1 className={globalStyles.marginSm}>Projects</h1>
          <p className={globalStyles.marginSm}>Here is a compilation of recent projects</p>
        </div>
      </main>
    </Layout>
  )
}

export const Head = () => <Seo title="Projects" />

export default Projects
