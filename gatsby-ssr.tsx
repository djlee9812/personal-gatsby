import React from 'react';
import type { GatsbySSR } from "gatsby"

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: 'en' });
  
  const gaId = process.env.GA_ID;
  if (gaId && gaId !== "undefined" && gaId !== "") {
    setHeadComponents([
      <script
        key="gtag-partytown"
        type="text/partytown"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />,
      <script
        key="gtag-init"
        type="text/partytown"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: typeof location !== 'undefined' ? location.pathname + location.search + location.hash : undefined,
              anonymize_ip: true,
              cookie_expires: 0,
            });
          `,
        }}
      />,
    ]);
  }
};
