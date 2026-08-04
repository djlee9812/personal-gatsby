import path from "node:path";
import { copyLibFiles } from "@qwik.dev/partytown/utils";
import type { GatsbyNode } from "gatsby";
import {
  countPostWords,
  getNeighbors,
  shouldShowTopNav,
  type PostNavSource,
} from "./src/utils/blog-post-nav";
import {
  findDuplicateSlugs,
  normalizeBlogSlug,
} from "./src/utils/blog-slug";

// Shared with gatsby-config via CommonJS (Gatsby loads config as CJS).
const { maxResults: CLOUDINARY_GALLERY_MAX_RESULTS } = require("./cloudinary-gallery-config");

const REQUIRED_CLOUDINARY_ENV = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

export const onPreBootstrap: GatsbyNode["onPreBootstrap"] = async ({ reporter }) => {
  const missing = REQUIRED_CLOUDINARY_ENV.filter(
    (name) => !process.env[name]?.trim(),
  );
  if (missing.length > 0) {
    reporter.panic(
      `Missing required Cloudinary environment variable(s): ${missing.join(", ")}. Set all of: ${REQUIRED_CLOUDINARY_ENV.join(", ")}.`
    );
  }

  await copyLibFiles(path.join(process.cwd(), "static", "~partytown"), {
    debugDir: false,
  });
};

/**
 * Warn when the sourced gallery hit the plugin page size (likely truncated).
 * Uses in-memory node count instead of a second Cloudinary Admin API round-trip.
 */
export const onPostBootstrap: GatsbyNode["onPostBootstrap"] = ({
  getNodesByType,
  reporter,
}) => {
  const count = getNodesByType("CloudinaryMedia").length;
  if (count >= CLOUDINARY_GALLERY_MAX_RESULTS) {
    reporter.warn(
      `Cloudinary gallery may be truncated: sourced ${count} image(s) (maxResults=${CLOUDINARY_GALLERY_MAX_RESULTS}). Raise maxResults or paginate in cloudinary-gallery-config.js.`
    );
  }
};

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({
  actions,
}) => {
  const { createTypes } = actions;
  createTypes(`
    type Mdx implements Node {
      frontmatter: MdxFrontmatter
    }
    type MdxFrontmatter {
      title: String
      date: Date @dateformat
      slug: String
      tags: [String]
      layout: String
    }
  `);
};

type BlogFileNode = Queries.WebsiteUpdateCreatePagesQuery["allFile"]["nodes"][number];

type BlogPostNode = BlogFileNode & {
  childMdx: NonNullable<BlogFileNode["childMdx"]> & {
    frontmatter: NonNullable<NonNullable<BlogFileNode["childMdx"]>["frontmatter"]> & {
      slug: string;
    };
    id: string;
  };
};

function isBlogPostNode(node: BlogFileNode): node is BlogPostNode {
  return Boolean(
    normalizeBlogSlug(node.childMdx?.frontmatter?.slug) && node.childMdx?.id
  );
}

export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql<Queries.WebsiteUpdateCreatePagesQuery>(`
    query WebsiteUpdateCreatePages {
      allFile(
        sort: [
          { childMdx: { frontmatter: { date: DESC } } }
          { childMdx: { frontmatter: { slug: ASC } } }
        ]
        filter: { sourceInstanceName: { eq: "blogs" } }
      ) {
        nodes {
          absolutePath
          childMdx {
            frontmatter {
              slug
              title
            }
            id
            body
          }
        }
      }
    }
  `);

  if (result.errors || !result.data) {
    reporter.panicOnBuild("Error loading MDX result", result.errors);
    return;
  }

  // Date DESC (slug ASC tiebreaker): index 0 = newest, last = oldest.
  const allNodes = result.data.allFile.nodes;
  const skipped = allNodes.filter(
    (node) =>
      node.childMdx && !normalizeBlogSlug(node.childMdx.frontmatter?.slug)
  );
  if (skipped.length > 0) {
    reporter.warn(
      `Skipping ${skipped.length} blog file(s) without frontmatter.slug`
    );
  }

  const posts = allNodes.filter(isBlogPostNode);
  const normalizedSlugs = posts.map(
    (post) => normalizeBlogSlug(post.childMdx.frontmatter.slug)!
  );
  const duplicateSlugs = findDuplicateSlugs(normalizedSlugs);
  if (duplicateSlugs.length > 0) {
    reporter.panicOnBuild(
      `Duplicate blog frontmatter.slug value(s): ${duplicateSlugs.join(", ")}`
    );
    return;
  }

  const navSources: PostNavSource[] = posts.map((node) => ({
    slug: normalizeBlogSlug(node.childMdx.frontmatter.slug)!,
    title: node.childMdx.frontmatter.title,
  }));
  const blogPostTemplate = path.resolve(`src/templates/blog-post.tsx`);

  posts.forEach((node, index) => {
    const mdxNode = node.childMdx;
    const slug = normalizeBlogSlug(mdxNode.frontmatter.slug)!;
    const { older, newer } = getNeighbors(navSources, index);
    const showTopNav = shouldShowTopNav(countPostWords(mdxNode.body));

    /**
     * We use the 'gatsby-plugin-mdx' layout pattern.
     * The template path must be combined with the actual MDX file path via '?__contentFilePath='
     * so that the MDX content is injected into the 'children' prop of the template.
     */
    createPage({
      path: `/blog/${slug}`,
      component: `${blogPostTemplate}?__contentFilePath=${node.absolutePath}`,
      context: {
        id: mdxNode.id,
        older,
        newer,
        showTopNav,
      },
    });
  });
};
