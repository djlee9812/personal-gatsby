require("dotenv").config({
  path: `.env`,
})

module.exports = {
  graphqlTypegen: true,
  siteMetadata: {
    title: `Dongjoon Lee's Personal Website`,
    siteUrl: `https://www.dongjoonlee.com`,
    description: `Dongjoon Lee's Personal Website`
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-partytown',
      options: {
        forward: ['gtag', 'dataLayer.push'],
      },
    },
    "gatsby-plugin-image", 
    "gatsby-plugin-sitemap", 
    "gatsby-plugin-sharp", 
    "gatsby-transformer-sharp", 
    "gatsby-plugin-mdx",
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: `images`,
        path: `${__dirname}/src/images/`
      },
      __key: "images"
    }, 
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: `gallery`,
        path: `${__dirname}/gallery/`
      },
      __key: "gallery"
    }, 
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: `blogs`,
        path: `${__dirname}/blogs/`
      },
      __key: "blogs"
    },
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        resolveEnv: () => process.env.CONTEXT || process.env.NODE_ENV,
        env: {
          production: {
            policy: [{ userAgent: '*', allow: '/' }]
          },
          'branch-deploy': {
            policy: [{ userAgent: '*', disallow: ['/'] }],
            sitemap: null,
            host: null
          },
          'deploy-preview': {
            policy: [{ userAgent: '*', disallow: ['/'] }],
            sitemap: null,
            host: null
          }
        }
      }
    },
    "gatsby-plugin-smoothscroll",
    "gatsby-plugin-netlify",
  ]
};