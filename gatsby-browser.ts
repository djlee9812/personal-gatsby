// gatsby-browser.ts
import './src/utils/fontawesome';
import type { GatsbyBrowser } from 'gatsby';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const onRouteUpdate: GatsbyBrowser['onRouteUpdate'] = ({ location }) => {
  const gaId = process.env.GATSBY_GA_ID;
  if (typeof window.gtag === 'function' && gaId) {
    window.gtag('config', gaId, {
      page_path: location.pathname + location.search + location.hash,
    });
  }
};
