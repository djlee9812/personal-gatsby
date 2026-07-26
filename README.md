# Dongjoon Lee's Personal Website

Welcome to the source code for my personal website! This site serves as an ongoing catalog of my life, featuring a gallery of my travels, a blog for my thoughts, and information about my background and hobbies like snowboarding and music.

The website can be accessed [here](https://www.dongjoonlee.com/)

## 🛠 Tech Stack

- **Framework:** [Gatsby v5](https://www.gatsbyjs.com/) — near-term strategy is stay on latest Gatsby 5.x; MDX and Cloudinary content stay portable without a framework migration.
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** CSS Modules
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Content:** [MDX](https://mdxjs.com/) for blog posts; [Cloudinary](https://cloudinary.com/) GraphQL (`src/pages/gallery.tsx`, image tags) for the gallery
- **Icons:** [FontAwesome](https://fontawesome.com/)
- **Deployment:** [Netlify](https://www.netlify.com/)

### Dependency overrides

`package.json` `overrides` pin patched transitive versions. Do not remove them blindly:

- Security patches for packages like `cookie`, `webpack`, `minimatch`, `cross-spawn`, and similar transitive deps
- Babel `@babel/plugin-proposal-*` aliases remapped to `@babel/plugin-transform-*` for Gatsby compatibility
- Review when Dependabot PRs land; drop an override only if the parent dependency already pulls a safe version


## 📂 Project Structure

- `blogs/`: MDX files for blog content.
- `src/pages/`: Main entry points (Home, Gallery, Blog, Projects).
- `src/components/`: Reusable React components.
- `src/data/`: Static data (e.g. flight routes, projects).
- `src/hooks/`: Custom React hooks (e.g., site metadata).
- `src/utils/` / `src/lib/`: Shared helpers (blog nav, Cloudinary URLs, flight routes).
- `scripts/`: Build helpers (e.g. Flighty export → flight JSON).
- `e2e/`: Playwright end-to-end tests.


## 🚀 Getting Started

1.  **Install dependencies:**
    ```shell
    npm install
    ```

2.  **Start developing:**
    ```shell
    npm run develop
    ```
    The site will be running at `http://localhost:8000`.

3.  **Build for production:**
    ```shell
    npm run build
    ```

4.  **Unit tests:**
    ```shell
    npm test
    ```

5.  **Rebuild flight map data** (optional; after updating Flighty exports):
    ```shell
    npm run flights:build
    ```

## ✅ CI checks

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes and pull requests, including unit tests:

1. `npm test` (unit tests under `src/utils/*.test.ts` and `src/lib/*.test.ts`)
2. `npm run build` (also generates `src/gatsby-types.d.ts` via `graphqlTypegen.generateOnBuild`)
3. `npm run typecheck`
4. `npm run test:links` (internal links in `public/`)
5. `npm run test:e2e` (Playwright smokes)

Add these repository secrets so the Cloudinary-backed build works in CI
(and the same names under **Dependabot secrets** so Dependabot PRs can build):

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Locally:

```shell
npm test                      # unit tests (no build needed)
npm run typecheck
npm run lint                  # Biome
npm run build
npm run test:links            # after a build
npx playwright install chromium   # once
npm run test:e2e
```

### Image pipelines

- **Gallery:** `gatsby-source-cloudinary` → GraphQL thumbs; lightbox uses `optimizeCloudinaryImage`.
- **Blog MDX:** hand-authored Cloudinary URLs via `src/components/blog/image.tsx` + `optimizeCloudinaryImage` (responsive `srcSet`).
- **Projects:** Cloudinary URLs in `src/data/projects.ts` go through the same optimizer; non-Cloudinary URLs pass through unchanged.