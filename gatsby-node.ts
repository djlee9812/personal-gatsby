import path from "path";
import { copyLibFiles } from "@qwik.dev/partytown/utils";
import type { GatsbyNode } from "gatsby";

export const onPreBootstrap: GatsbyNode["onPreBootstrap"] = async () => {
  await copyLibFiles(path.join(process.cwd(), "static", "~partytown"));
};

export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result: any = await graphql(`
    query {
      allFile(
        sort: {childMdx: {frontmatter: {date: DESC}}}
        filter: {sourceInstanceName: {eq: "blogs"}}
      ) {
        nodes {
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

  if (result.errors) {
    reporter.panicOnBuild('Error loading MDX result', result.errors);
    return;
  }

  const posts = result.data.allFile.nodes;
  const blogPostTemplate = path.resolve(`src/templates/blog-post.tsx`);

  posts.forEach((node: any) => {
    const mdxNode = node.childMdx;
    if (mdxNode && mdxNode.frontmatter && mdxNode.frontmatter.slug) {
      createPage({
        path: `/blog/${mdxNode.frontmatter.slug}`,
        component: blogPostTemplate,
        context: {
          id: mdxNode.id,
        },
      });
    }
  });
};
