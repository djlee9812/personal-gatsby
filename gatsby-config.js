/**
 * @typedef {import("gatsby").GatsbyConfig} GatsbyConfig
 */

require("dotenv").config({
  path: `.env`,
});

const { maxResults: cloudinaryMaxResults } = require("./cloudinary-gallery-config");

/** @type {GatsbyConfig} */
const config = {
  graphqlTypegen: {
    // Default is develop-only; CI typechecks after `gatsby build`.
    generateOnBuild: true,
  },
  siteMetadata: {
    title: `Dongjoon Lee's Personal Website`,
    siteUrl: `https://www.dongjoonlee.com`,
    description: `Dongjoon Lee's Personal Website`,
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-sitemap",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        mdxOptions: {
          rehypePlugins: [require("rehype-unwrap-images")],
        },
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "blogs",
        path: `${__dirname}/blogs/`,
      },
      __key: "blogs",
    },
    {
      resolve: "gatsby-plugin-robots-txt",
      options: {
        resolveEnv: () => process.env.CONTEXT || process.env.NODE_ENV,
        env: {
          production: {
            policy: [{ userAgent: "*", allow: "/" }],
          },
          "branch-deploy": {
            policy: [{ userAgent: "*", disallow: ["/"] }],
            sitemap: null,
            host: null,
          },
          "deploy-preview": {
            policy: [{ userAgent: "*", disallow: ["/"] }],
            sitemap: null,
            host: null,
          },
        },
      },
    },
    {
      resolve: "gatsby-source-cloudinary",
      options: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        resourceType: "image",
        maxResults: cloudinaryMaxResults,
        context: true,
        tags: true,
      },
    },
    {
      resolve: "gatsby-transformer-cloudinary",
      options: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        transformTypes: ["CloudinaryMedia"],
      },
    },
  ],
};

module.exports = config;
