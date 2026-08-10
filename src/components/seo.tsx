import type * as React from 'react'
import { useSiteMetadata } from '../hooks/use-site-metadata'
import { buildSeoUrl } from '../utils/seo-url'

interface SeoProps {
  title?: string
  description?: string
  pathname?: string
  noIndex?: boolean
  children?: React.ReactNode
}

const Seo = ({ title, description, pathname, noIndex = false, children }: SeoProps) => {
  const { title: defaultTitle, description: defaultDescription, siteUrl } = useSiteMetadata()

  const seo = {
    title: title ? `${title} | ${defaultTitle ?? ""}` : (defaultTitle ?? ""),
    description: description || defaultDescription || "",
    url: buildSeoUrl(siteUrl, pathname),
  }

  const schemaOrgJSONLD = noIndex
    ? null
    : {
        "@context": "http://schema.org",
        "@type": "Person",
        "name": "Dongjoon Lee",
        "url": siteUrl ?? seo.url,
        "affiliation": [
          {
            "@type": "Organization",
            "name": "MathWorks"
          },
          {
            "@type": "Organization",
            "name": "Massachusetts Institute of Technology"
          }
        ],
        "jobTitle": "Software Engineer",
        "description": defaultDescription || seo.description
      }

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {!noIndex ? <link rel="canonical" href={seo.url} /> : null}
      {noIndex ? <meta name="robots" content="noindex, follow" /> : null}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      {!noIndex ? <meta property="og:url" content={seo.url} /> : null}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {!noIndex ? <meta name="twitter:url" content={seo.url} /> : null}

      {schemaOrgJSONLD ? (
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgJSONLD)}
        </script>
      ) : null}

      {children}
    </>
  )
}

export default Seo
