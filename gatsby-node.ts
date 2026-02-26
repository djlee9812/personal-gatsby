import path from "path";
import { copyLibFiles } from "@qwik.dev/partytown/utils";
import type { GatsbyNode } from "gatsby";

export const onPreBootstrap: GatsbyNode["onPreBootstrap"] = async () => {
  await copyLibFiles(path.join(process.cwd(), "static", "~partytown"));
};

export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql<Queries.WebsiteUpdateCreatePagesQuery>(`
    query WebsiteUpdateCreatePages {
      allFile(
        sort: {childMdx: {frontmatter: {date: DESC}}}
        filter: {sourceInstanceName: {eq: "blogs"}}
      ) {
        nodes {
          absolutePath
          childMdx {
            frontmatter {
              slug
            }
            id
          }
        }
      }
    }
  `);

  if (result.errors || !result.data) {
    reporter.panicOnBuild('Error loading MDX result', result.errors);
    return;
  }

  const posts = result.data.allFile.nodes;
  const blogPostTemplate = path.resolve(`src/templates/blog-post.tsx`);

  posts.forEach((node) => {
    const mdxNode = node.childMdx;
    if (mdxNode?.frontmatter?.slug) {
      /**
       * We use the 'gatsby-plugin-mdx' layout pattern.
       * The template path must be combined with the actual MDX file path via '?__contentFilePath='
       * so that the MDX content is injected into the 'children' prop of the template.
       */
      createPage({
        path: `/blog/${mdxNode.frontmatter.slug}`,
        component: `${blogPostTemplate}?__contentFilePath=${node.absolutePath}`,
        context: {
          id: mdxNode.id,
        },
      });
    }
  });
};
