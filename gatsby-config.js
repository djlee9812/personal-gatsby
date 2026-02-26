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
    "gatsby-plugin-image", 
    "gatsby-plugin-sitemap", 
    "gatsby-plugin-sharp", 
    "gatsby-transformer-sharp", 
    "gatsby-plugin-mdx",
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
    {
      resolve: `gatsby-source-cloudinary`,
      options: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        resourceType: `image`,
        maxResults: 500,
        context: true, // Fetch context (tags, alt text, custom fields)
        tags: true,    // Fetch tags
      },
    },
    {
      resolve: `gatsby-transformer-cloudinary`,
      options: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        transformTypes: [`CloudinaryMedia`],
      },
    },
  ]
};