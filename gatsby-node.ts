import path from "path";
import { copyLibFiles } from "@qwik.dev/partytown/utils";
import type { GatsbyNode } from "gatsby";
import {
  countPostWords,
  getNeighbors,
  shouldShowTopNav,
  type PostNavSource,
} from "./src/utils/blog-post-nav";

export const onPreBootstrap: GatsbyNode["onPreBootstrap"] = async () => {
  await copyLibFiles(path.join(process.cwd(), "static", "~partytown"));
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
  return Boolean(node.childMdx?.frontmatter?.slug && node.childMdx.id);
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
  const posts = result.data.allFile.nodes.filter(isBlogPostNode);
  const navSources: PostNavSource[] = posts.map((node) => ({
    slug: node.childMdx.frontmatter.slug,
    title: node.childMdx.frontmatter.title,
  }));
  const blogPostTemplate = path.resolve(`src/templates/blog-post.tsx`);

  posts.forEach((node, index) => {
    const mdxNode = node.childMdx;
    const slug = mdxNode.frontmatter.slug;
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
