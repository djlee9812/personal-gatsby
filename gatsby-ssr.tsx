// Parcel compiles root Gatsby files with classic JSX; keep React in scope at runtime.
// biome-ignore lint/correctness/noUnusedImports: required for Parcel classic JSX transform
import React from "react"
import type { GatsbySSR } from "gatsby"
import { Partytown } from "@qwik.dev/partytown/react"
import "./src/utils/fontawesome"

export const onRenderBody: GatsbySSR["onRenderBody"] = ({
  setHtmlAttributes,
  setHeadComponents,
}) => {
  setHtmlAttributes({ lang: "en" })

  const headComponents = [
    <link
      key="preconnect-cloudinary"
      rel="preconnect"
      href="https://res.cloudinary.com"
      crossOrigin="anonymous"
    />,
    <link
      key="dns-cloudinary"
      rel="dns-prefetch"
      href="https://res.cloudinary.com"
    />,
  ]

  // Single analytics path: GA4 via Partytown (`GATSBY_GA_ID`).
  // Do not set GATSBY_GTAG_ID — unused (incomplete GTM noscript path removed).
  const gaId = process.env.GATSBY_GA_ID

  if (gaId && gaId !== "undefined" && gaId !== "") {
    headComponents.push(
      <Partytown
        key="partytown"
        forward={["gtag", "dataLayer.push"]}
        lib="/~partytown/"
      />,
      <script
        key="gtag-js"
        type="text/partytown"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />,
      <script
        key="gtag-init"
        type="text/partytown"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag(){window.dataLayer.push(arguments);}
            window.gtag('js', new Date());
            window.gtag('config', '${gaId}', {
              anonymize_ip: true,
              cookie_expires: 0,
            });
          `,
        }}
      />,
    )
  }

  setHeadComponents(headComponents)
}
