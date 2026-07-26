import type * as React from "react"

export type QueryFallbackKind = "static-query" | "generic"

type QueryErrorFallbackProps = {
  kind?: QueryFallbackKind
}

const FALLBACK_COPY: Record<
  QueryFallbackKind,
  { title: string; body: string }
> = {
  "static-query": {
    title: "Page data not ready",
    body: "This is usually a temporary issue. Refreshing the page often fixes it.",
  },
  generic: {
    title: "Something went wrong",
    body: "Try refreshing the page.",
  },
}

const REFRESH_LABEL = "Refresh page"

const shellStyle: React.CSSProperties = {
  padding: "2rem",
  maxWidth: "480px",
  margin: "4rem auto",
  fontFamily: "system-ui, sans-serif",
  textAlign: "center",
}

const titleStyle: React.CSSProperties = {
  marginBottom: "1rem",
  fontSize: "1.25rem",
}

const bodyStyle: React.CSSProperties = {
  color: "#666",
  marginBottom: "1.5rem",
}

const buttonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  fontSize: "1rem",
  cursor: "pointer",
  backgroundColor: "#333",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
}

function FallbackContent({ kind }: { kind: QueryFallbackKind }) {
  const { title, body } = FALLBACK_COPY[kind]
  return (
    <div style={shellStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <p style={bodyStyle}>{body}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={buttonStyle}
      >
        {REFRESH_LABEL}
      </button>
    </div>
  )
}

/**
 * Shared fallback for StaticQuery / render failures (boundary + optional overlay).
 */
export function QueryErrorFallback({
  kind = "generic",
}: QueryErrorFallbackProps) {
  return <FallbackContent kind={kind} />
}

const OVERLAY_ID = "query-error-overlay"

function cssPropsToStyle(styles: React.CSSProperties): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const prop = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
      return `${prop}:${value}`
    })
    .join(";")
}

/** Non-destructive overlay when an error escapes React (does not wipe `#___gatsby`). */
export function showQueryErrorOverlay(
  kind: QueryFallbackKind = "static-query"
): void {
  if (typeof document === "undefined") return
  if (document.getElementById(OVERLAY_ID)) return

  const { title, body } = FALLBACK_COPY[kind]
  const overlay = document.createElement("div")
  overlay.id = OVERLAY_ID
  overlay.setAttribute("role", "alert")
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "99999",
    background: "var(--color-bg-primary, #f8f9fa)",
    overflow: "auto",
  })
  // Same style objects as the React fallback — keep paths visually in sync.
  overlay.innerHTML =
    `<div style="${cssPropsToStyle(shellStyle)}">` +
    `<h2 style="${cssPropsToStyle(titleStyle)}">${title}</h2>` +
    `<p style="${cssPropsToStyle(bodyStyle)}">${body}</p>` +
    `<button type="button" onclick="window.location.reload()" style="${cssPropsToStyle(buttonStyle)}">${REFRESH_LABEL}</button>` +
    `</div>`
  document.body.appendChild(overlay)
}

export function clearQueryErrorOverlay(): void {
  if (typeof document === "undefined") return
  document.getElementById(OVERLAY_ID)?.remove()
}

export function isStaticQueryErrorMessage(message: string): boolean {
  return (
    message.includes("StaticQuery") && message.includes("could not be fetched")
  )
}
