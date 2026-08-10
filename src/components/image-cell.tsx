import * as React from 'react'
import * as styles from './image-cell.module.css'

interface ImageCellProps {
  src: string
  srcSet?: string
  sizes?: string
  width?: number | null
  height?: number | null
  alt: string
  onClick: (trigger: HTMLElement) => void
  placeholderSrc?: string
  loading?: "lazy" | "eager"
}

const FALLBACK_ASPECT = 4 / 3

const ImageCell = ({
  src,
  srcSet,
  sizes,
  width,
  height,
  alt,
  onClick,
  placeholderSrc,
  loading = "lazy",
}: ImageCellProps) => {
  const [loadedSrc, setLoadedSrc] = React.useState("")
  const imgRef = React.useRef<HTMLImageElement>(null)

  const hasIntrinsic =
    typeof width === "number" &&
    width > 0 &&
    typeof height === "number" &&
    height > 0
  const aspectRatio = hasIntrinsic ? width / height : FALLBACK_ASPECT
  const imageLoaded = Boolean(src) && loadedSrc === src

  React.useLayoutEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setLoadedSrc(src)
    }
  }, [src])

  const handleActivate = (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => {
    onClick(e.currentTarget)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') e.preventDefault();
      handleActivate(e);
    }
  };

  const frameStyle = {
    "--thumb-aspect-ratio": aspectRatio,
  } as React.CSSProperties

  return (
    <div 
      className={styles.cell} 
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={alt}
    >
      <div className={styles.imageFrame} style={frameStyle}>
        {!imageLoaded && placeholderSrc ? (
          <img
            className={styles.placeholderThumb}
            src={placeholderSrc}
            alt=""
            aria-hidden="true"
            decoding="async"
          />
        ) : null}
        {/* Decorative: accessible name comes from the button aria-label. */}
        <img
          ref={imgRef}
          className={`${styles.masonryImg}${imageLoaded ? ` ${styles.masonryImgReady}` : ""}`}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          width={hasIntrinsic ? width : undefined}
          height={hasIntrinsic ? height : undefined}
          alt=""
          loading={loading}
          decoding="async"
          onLoad={() => setLoadedSrc(src)}
          // Keep blur placeholder visible on failure (unlike modal, which must
          // clear aria-busy); an empty broken thumb is worse than leaving LQIP.
        />
      </div>
      <span className={styles.imageText} aria-hidden="true">{alt}</span>
    </div>
  )
}

export default ImageCell
