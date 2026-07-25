import * as React from 'react'
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'
import FocusTrap from 'focus-trap-react'
import * as globalStyles from './global.module.css'
import * as styles from './image-modal.module.css'

interface ImageModalProps {
  image: IGatsbyImageData
  alt: string
  close: () => void
  nextImg: () => void
  prevImg: () => void
}

const ImageModal = ({ image, alt, close, nextImg, prevImg }: ImageModalProps) => {
  const modalRef = React.useRef<HTMLDivElement>(null)
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const titleId = React.useId()
  const displayAlt = (alt ?? "").trim() || "Gallery image"

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

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
          tabIndex={-1}
        >
          <h3 id={titleId} className={styles.modalTitle}>{displayAlt}</h3>
          <button
            type="button"
            className={`${globalStyles.hiddenButton} ${styles.closeBtn}`}
            onClick={close}
            aria-label="Close"
            ref={closeRef}
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <GatsbyImage className={styles.modalImage} image={image} alt={displayAlt} objectFit="contain" />
        </div>
      </div>
    </FocusTrap>
  )
}

export default ImageModal
