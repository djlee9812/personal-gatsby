// gatsby-browser.ts
import React from 'react';
import './src/utils/fontawesome';
import type { GatsbyBrowser } from 'gatsby';
import { QueryErrorBoundary } from './src/components/query-error-boundary';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const STATIC_QUERY_ERROR = 'StaticQuery';
const COULD_NOT_BE_FETCHED = 'could not be fetched';

function isStaticQueryError(message: string): boolean {
  return message.includes(STATIC_QUERY_ERROR) && message.includes(COULD_NOT_BE_FETCHED);
}

function showStaticQueryFallback(): void {
  const root = document.getElementById('___gatsby');
  if (!root) return;
  root.innerHTML =
    '<div style="padding:2rem;max-width:480px;margin:4rem auto;font-family:system-ui,sans-serif;text-align:center">' +
    '<h2 style="margin-bottom:1rem;font-size:1.25rem">Page data not ready</h2>' +
    '<p style="color:#666;margin-bottom:1.5rem">This is usually temporary. Refreshing the page often fixes it.</p>' +
    '<button type="button" onclick="window.location.reload()" style="padding:0.5rem 1rem;font-size:1rem;cursor:pointer;background:#333;color:#fff;border:none;border-radius:4px">Refresh page</button>' +
    '</div>';
}

export const onClientEntry: GatsbyBrowser['onClientEntry'] = () => {
  // Development: unregister Partytown service workers so Gatsby's "service workers present" warning doesn't appear.
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => {
        if (reg.scope.includes('partytown')) reg.unregister();
      });
    });
  }

  // Suppress THREE.Clock deprecation warning (R3F/three internals; we don't use Clock directly).
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
    if (msg.includes('THREE.Clock') && msg.includes('deprecated')) return;
    origWarn.apply(console, args);
  };

  const handle = (e: ErrorEvent | PromiseRejectionEvent): void => {
    const message =
      e instanceof ErrorEvent
        ? (e.error && (e.error as Error).message) || e.message || ''
        : (e.reason && (e.reason instanceof Error ? e.reason.message : String(e.reason))) || '';
    if (isStaticQueryError(message)) {
      const ev = e as Event;
      if (typeof ev.preventDefault === 'function') ev.preventDefault();
      if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
      showStaticQueryFallback();
    }
  };
  window.addEventListener('error', handle);
  window.addEventListener('unhandledrejection', handle as (e: PromiseRejectionEvent) => void);
};

export const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({ element }) =>
  React.createElement(QueryErrorBoundary, null, element);

export const onRouteUpdate: GatsbyBrowser['onRouteUpdate'] = ({ location }) => {
  const gaId = process.env.GATSBY_GA_ID;
  if (typeof window.gtag === 'function' && gaId) {
    window.gtag('config', gaId, {
      page_path: location.pathname + location.search + location.hash,
    });
  }
};
