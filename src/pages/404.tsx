import * as React from "react"
import { Link, HeadFC } from "gatsby"
// @ts-ignore
import { navbarMargin } from '../components/global.module.css'
import Layout from '../components/layout'
import Seo from '../components/seo'
// @ts-ignore
import { notFoundDiv } from '../components/404.module.css'

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

export const Head: HeadFC = () => <Seo title="404" />

export default NotFoundPage
