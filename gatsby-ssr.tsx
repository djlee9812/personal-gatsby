
import type { GatsbySSR } from "gatsby"
import { Partytown } from "@qwik.dev/partytown/react"
import "./src/utils/fontawesome"
import { QueryErrorBoundary } from "./src/components/query-error-boundary"
import { locationResetKey } from "./src/utils/location-reset-key"

export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({
  element,
  props,
}) => (
  <QueryErrorBoundary resetKey={locationResetKey(props.location)}>
    {element}
  </QueryErrorBoundary>
)

export const onRenderBody: GatsbySSR["onRenderBody"] = ({
  setHtmlAttributes,
  setHeadComponents,
}) => {
  setHtmlAttributes({ lang: "en" })

  // Single analytics path: GA4 via Partytown (`GATSBY_GA_ID`).
  // Do not set GATSBY_GTAG_ID — unused (incomplete GTM noscript path removed).
  const gaId = process.env.GATSBY_GA_ID

  if (gaId && gaId !== "undefined" && gaId !== "") {
    setHeadComponents([
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
    ])
  }
}
