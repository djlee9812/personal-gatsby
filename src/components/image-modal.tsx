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
  returnFocusRef?: React.RefObject<HTMLElement | null>
}

const ImageModal = ({
  src,
  alt,
  aspectRatio,
  placeholderSrc,
  close,
  nextImg,
  prevImg,
  returnFocusRef,
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

  // Layout phase so lock/unlock paint together with the modal (avoids a
  // post-paint scroll flash). FocusTrap still returns focus in its own
  // willUnmount first; we only need restore to finish before browser paint.
  React.useLayoutEffect(() => {
    if (!hasMedia) return

    // overflow:hidden alone does not stop background scroll on iOS Safari.
    // Pin the body and restore scrollY on close so the page does not jump.
    const { body } = document
    const root = document.documentElement
    const scrollY = window.scrollY
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      scrollBehavior: root.style.scrollBehavior,
    }

    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.width = "100%"
    closeRef.current?.focus()

    return () => {
      body.style.overflow = previous.overflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      // html { scroll-behavior: smooth } makes scrollTo(..., behavior:"auto")
      // animate; temporarily force auto so restore is instant. Prefer this over
      // behavior:"instant" so older engines that lack that enum stay correct.
      root.style.scrollBehavior = "auto"
      window.scrollTo(0, scrollY)
      root.style.scrollBehavior = previous.scrollBehavior
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
        clickOutsideDeactivates: false,
        setReturnFocus: () => returnFocusRef?.current ?? false,
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
