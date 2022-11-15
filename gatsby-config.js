module.exports = {
  siteMetadata: {
    title: `Dongjoon Lee's Personal Website`,
    siteUrl: `https://www.dongjoonlee.com`,
    description: `Dongjoon Lee's Personal Website`
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        "trackingId": "G-V70EH5DW3Q"
      }
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
    "@react-icons/all-files",
    "gatsby-plugin-smoothscroll"
    
  ]
};