# Dongjoon Lee's Personal Website

Welcome to the source code for my personal website! This site serves as an ongoing catalog of my life, featuring a gallery of my travels, a blog for my thoughts, and information about my background and hobbies like snowboarding and music.

The website can be accessed [here](https://www.dongjoonlee.com/)

## 🛠 Tech Stack

- **Framework:** [Gatsby v5](https://www.gatsbyjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** CSS Modules
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Content:** [MDX](https://mdxjs.com/) (for blog posts and gallery data)
- **Icons:** [FontAwesome](https://fontawesome.com/)
- **Deployment:** [Netlify](https://www.netlify.com/)


## 📂 Project Structure

- `src/pages/`: Main entry points for the site (Home, Gallery, Blog).
- `src/components/`: Reusable React components.
- `src/hooks/`: Custom React hooks (e.g., site metadata).
- `blogs/`: MDX files for blog content.
- `gallery/`: MDX files and image data for the gallery.
- `src/images/`: Static images used across the site.


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

## ✅ CI checks

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes and pull requests:

1. `npm run build` (also generates `src/gatsby-types.d.ts` via `graphqlTypegen.generateOnBuild`)
2. `npm run typecheck`
3. `npm run test:links` (internal links in `public/`)
4. `npm run test:e2e` (Playwright smokes)

Add these repository secrets so the Cloudinary-backed build works in CI:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Locally (after a build):

```shell
npm run typecheck
npm run test:links
npx playwright install chromium   # once
npm run test:e2e
```
