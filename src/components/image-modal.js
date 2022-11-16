import * as React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'
import FocusTrap from 'focus-trap-react'
import { hiddenButton } from './global.module.css'
import { modal, modalContent, closeBtn, modalImage, modalTitle } from './image-modal.module.css'

const ImageModal = ({ image, alt, close, nextImg, prevImg }) => {
  const [imgData, setImgData] = React.useState(image);
  const [altText, setAltText] = React.useState(alt);

  const modalRef = React.useRef(null);
  const closeRef = React.useRef(null);
  
  React.useEffect(() => {
    setImgData(image);
    setAltText(alt);
    closeRef.current.focus();
  }, [image, alt]);

  const handleKey = (event) => {
    event.preventDefault()
    if (event.key === 'Escape') {
      close()
    }
    if (event.key === 'ArrowRight') {
      nextImg()
    }
    if (event.key === 'ArrowLeft') {
      prevImg()
    }
  }

  const clickModal = (event) => {
    if (event.target === modalRef.current) {
      close()  
    }
  }

  return (
    <FocusTrap>
      <aside 
        tag="aside"
        className={modal} 
        ref={modalRef} 
        role="dialog" 
        aria-modal="true"
        tabIndex="-1"
        onClick={clickModal} 
        onKeyDown={handleKey} 
      >
        <div className={modalContent}>
          <h3 className={modalTitle}>{alt}</h3>
          <button className={`${hiddenButton} ${closeBtn}`} onClick={close} onKeyDown={handleKey} ref={closeRef}>
            <span>&times;</span>
          </button>
          <GatsbyImage className={modalImage} image={imgData} alt={altText} objectFit="contain" />
        </div>
      </aside>
    </FocusTrap>
  )
}

export default ImageModal