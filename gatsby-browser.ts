// gatsby-browser.ts
import './src/utils/fontawesome';
import type { GatsbyBrowser } from 'gatsby';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    GA_ID?: string;
  }
}

export const onRouteUpdate: GatsbyBrowser['onRouteUpdate'] = ({ location }) => {
  if (typeof window.gtag === 'function' && window.GA_ID) {
    window.gtag('config', window.GA_ID, {
      page_path: location.pathname + location.search + location.hash,
    });
  }
};
