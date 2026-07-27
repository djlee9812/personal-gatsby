import type * as React from 'react'
import Layout from './layout'
import { MotionProvider } from './motion-provider'

/**
 * Layout + LazyMotion for routes that use framer-motion `m.*`.
 * Keep gallery / blog posts / 404 on plain Layout so they skip the motion chunk.
 */
const AnimatedLayout = ({ children }: { children: React.ReactNode }) => (
  <Layout>
    <MotionProvider>{children}</MotionProvider>
  </Layout>
)

export default AnimatedLayout
