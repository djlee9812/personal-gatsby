import * as React from 'react'
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'
import FocusTrap from 'focus-trap-react'
// @ts-ignore
import { hiddenButton } from './global.module.css'
// @ts-ignore
import { modal, modalContent, closeBtn, modalImage, modalTitle } from './image-modal.module.css'

interface ImageModalProps {
  image: IGatsbyImageData
  alt: string
  close: () => void
  nextImg: () => void
  prevImg: () => void
}

const ImageModal = ({ image, alt, close, nextImg, prevImg }: ImageModalProps) => {
  const [imgData, setImgData] = React.useState(image);
  const [altText, setAltText] = React.useState(alt);

  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    setImgData(image);
    setAltText(alt);
    if (closeRef.current) {
      closeRef.current.focus();
    }
  }, [image, alt]);

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
    <FocusTrap>
      <div 
        className={modal} 
        ref={modalRef} 
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
        onClick={clickModal} 
        onKeyDown={handleKey} 
      >
        <div 
          className={modalContent}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <h3 className={modalTitle}>{altText}</h3>
          <button className={`${hiddenButton} ${closeBtn}`} onClick={close} onKeyDown={handleKey} ref={closeRef}>
            <span>&times;</span>
          </button>
          <GatsbyImage className={modalImage} image={imgData} alt={altText} objectFit="contain" />
        </div>
      </div>
    </FocusTrap>
  )
}

export default ImageModal
