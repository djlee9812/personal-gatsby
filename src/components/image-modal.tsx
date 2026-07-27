import * as React from 'react'
import FocusTrap from 'focus-trap-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as globalStyles from './global.module.css'
import * as styles from './image-modal.module.css'
import { optimizeCloudinaryImage } from '../utils/cloudinary'

interface ImageModalProps {
  src: string
  alt: string
  aspectRatio: number
  placeholderSrc?: string
  close: () => void
  nextImg: () => void
  prevImg: () => void
}

const ImageModal = ({
  src,
  alt,
  aspectRatio,
  placeholderSrc,
  close,
  nextImg,
  prevImg,
}: ImageModalProps) => {
  const modalRef = React.useRef<HTMLDivElement>(null)
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const titleId = React.useId()
  const displayAlt = (alt ?? "").trim() || "Gallery image"
  const [loadedSrc, setLoadedSrc] = React.useState("")

  // Match stage max widths so srcset picks a sensible candidate.
  const optimized = optimizeCloudinaryImage(src, {
    width: 1600,
    sizes: "(max-width: 767px) 96vw, 90vw",
  })
  const hasMedia = Boolean((src ?? "").trim())
  // Stale loadedSrc from a previous src already makes imageLoaded false — no
  // separate reset effect (that raced after this layout check and could leave
  // cached images stuck invisible if onLoad did not re-fire).
  const imageLoaded = Boolean(optimized.src) && loadedSrc === optimized.src
  const safeAspectRatio =
    Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 4 / 3

  React.useLayoutEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setLoadedSrc(optimized.src)
    }
  }, [optimized.src])

  React.useEffect(() => {
    if (!hasMedia) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [hasMedia])

  const handleKey = (event: React.KeyboardEvent | KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      nextImg()
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      prevImg()
    }
  }

  const clickModal = (event: React.MouseEvent) => {
    if (event.target === modalRef.current) {
      close()
    }
  }

  if (!hasMedia) {
    return null
  }

  const stageStyle = {
    "--aspect-ratio": safeAspectRatio,
  } as React.CSSProperties

  return (
    <FocusTrap
      focusTrapOptions={{
        escapeDeactivates: false,
        allowOutsideClick: true,
        onDeactivate: close,
      }}
    >
      <div
        className={styles.modal}
        ref={modalRef}
        onClick={clickModal}
        onKeyDown={handleKey}
      >
        <div
          className={styles.modalContent}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-busy={!imageLoaded}
          tabIndex={-1}
        >
          <div className={styles.imageStage} style={stageStyle}>
            <button
              type="button"
              className={`${globalStyles.hiddenButton} ${styles.closeBtn}`}
              onClick={close}
              aria-label="Close"
              ref={closeRef}
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <button
              type="button"
              className={`${globalStyles.hiddenButton} ${styles.navBtn} ${styles.prevBtn}`}
              onClick={prevImg}
              aria-label="Previous image"
            >
              <FontAwesomeIcon icon={['fas', 'chevron-left']} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${globalStyles.hiddenButton} ${styles.navBtn} ${styles.nextBtn}`}
              onClick={nextImg}
              aria-label="Next image"
            >
              <FontAwesomeIcon icon={['fas', 'chevron-right']} aria-hidden="true" />
            </button>
            {!imageLoaded && placeholderSrc ? (
              <img
                className={styles.placeholderThumb}
                src={placeholderSrc}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
            ) : null}
            <img
              key={optimized.src}
              className={`${styles.modalImage}${imageLoaded ? ` ${styles.modalImageReady}` : ""}`}
              src={optimized.src}
              srcSet={optimized.srcSet}
              sizes={optimized.sizes}
              alt={displayAlt}
              loading="eager"
              decoding="async"
              onLoad={() => setLoadedSrc(optimized.src)}
              onError={() => setLoadedSrc(optimized.src)}
              ref={imgRef}
            />
            <h3 id={titleId} className={styles.modalTitle}>{displayAlt}</h3>
          </div>
        </div>
      </div>
    </FocusTrap>
  )
}

export default ImageModal
