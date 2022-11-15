import * as React from "react"
import { Link } from "gatsby"
import Layout from '../components/layout'
import Seo from '../components/seo'
import { navbarMargin } from '../components/global.module.css'
import { notFoundDiv } from '../components/404.module.css'

// markup
const NotFoundPage = () => {
  return (
    <Layout darkNavbar={true}>
      <main className={navbarMargin}>
          <div className={notFoundDiv}>
            <h1>404: Page not found</h1>
            <p>The page you're looking for doesn't exist. Return&nbsp;
              <Link to="/">Home</Link>
            </p>
          </div>
      </main>
    </Layout>
  )
}

export const Head = () => <Seo title="404" />

export default NotFoundPage
