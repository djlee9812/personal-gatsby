// gatsby-browser.ts
import "./src/utils/fontawesome"
import type { GatsbyBrowser } from "gatsby"
import {
  clearQueryErrorOverlay,
  isStaticQueryErrorMessage,
  showQueryErrorOverlay,
} from "./src/components/query-error-fallback"
import { locationResetKey } from "./src/utils/location-reset-key"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export const onClientEntry: GatsbyBrowser["onClientEntry"] = () => {
  // Development: unregister Partytown service workers so Gatsby's "service workers present" warning doesn't appear.
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    "serviceWorker" in navigator
  ) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => {
        if (reg.scope.includes("partytown")) reg.unregister()
      })
    })
  }

  // Suppress THREE.Clock deprecation warning (R3F/three internals; we don't use Clock directly).
  const origWarn = console.warn
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : String(args[0])
    if (msg.includes("THREE.Clock") && msg.includes("deprecated")) return
    origWarn.apply(console, args)
  }

  const handle = (e: ErrorEvent | PromiseRejectionEvent): void => {
    const message =
      e instanceof ErrorEvent
        ? (e.error && (e.error as Error).message) || e.message || ""
        : (e.reason &&
            (e.reason instanceof Error ? e.reason.message : String(e.reason))) ||
          ""
    if (isStaticQueryErrorMessage(message)) {
      const ev = e as Event
      if (typeof ev.preventDefault === "function") ev.preventDefault()
      if (typeof ev.stopPropagation === "function") ev.stopPropagation()
      // Overlay only — never wipe `#___gatsby` (that killed React + the boundary).
      showQueryErrorOverlay("static-query")
    }
  }
  window.addEventListener("error", handle)
  window.addEventListener(
    "unhandledrejection",
    handle as (e: PromiseRejectionEvent) => void
  )
}

export const onRouteUpdate: GatsbyBrowser["onRouteUpdate"] = ({ location }) => {
  clearQueryErrorOverlay()

  const gaId = process.env.GATSBY_GA_ID
  if (typeof window.gtag === "function" && gaId) {
    window.gtag("config", gaId, {
      page_path: locationResetKey(location),
    })
  }
}

// Gallery collection switches are same-pathname `?c=` navigations. Gatsby's
// default scroll restoration would undo gallery.tsx's reset and blank the
// viewport; the page handles scroll itself.
export const shouldUpdateScroll: GatsbyBrowser["shouldUpdateScroll"] = ({
  prevRouterProps,
  routerProps,
}) => {
  const prevPath = prevRouterProps?.location.pathname
  const nextPath = routerProps.location.pathname
  if (
    prevPath &&
    prevPath === nextPath &&
    nextPath.replace(/\/+$/, "") === "/gallery"
  ) {
    return false
  }
  return true
}
