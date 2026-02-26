import React from 'react';
import type { GatsbySSR } from "gatsby";
import { Partytown } from "@qwik.dev/partytown/react";

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHtmlAttributes, setHeadComponents, setPreBodyComponents }) => {
  setHtmlAttributes({ lang: 'en' });
  
  const gaId = process.env.GA_ID;
  const gtmId = process.env.GTAG_ID;

  if (gaId && gaId !== "undefined" && gaId !== "") {
    setHeadComponents([
      <Partytown 
        key="partytown" 
        forward={['gtag', 'dataLayer.push']} 
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
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              anonymize_ip: true,
              cookie_expires: 0,
            });
          `,
        }}
      />,
      // We set the ID on the main thread so gatsby-browser.ts can access it
      <script
        key="gtag-id-main"
        dangerouslySetInnerHTML={{
          __html: `window.GA_ID = '${gaId}';`,
        }}
      />,
    ]);
  }

  if (gtmId && gtmId !== "undefined" && gtmId !== "") {
    setPreBodyComponents([
      <noscript
        key="gtm-noscript"
        dangerouslySetInnerHTML={{
          __html: `
            <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0"
                style="display:none;visibility:hidden"></iframe>
          `,
        }}
      />,
    ]);
  }
};
