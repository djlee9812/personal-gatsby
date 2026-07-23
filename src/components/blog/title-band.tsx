import * as React from "react"

export type TitleBandProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Date/location band under a section heading (food/travel posts).
 * Width follows the text; hairline border sits under the label only.
 */
const TitleBand = ({ children, className }: TitleBandProps) => {
  return (
    <div className={["post-title-band", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  )
}

export default TitleBand
