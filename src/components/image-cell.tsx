import * as React from 'react'
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'
import * as styles from './image-cell.module.css'

interface ImageCellProps {
  image: IGatsbyImageData
  alt: string
  onClick: () => void
}

const ImageCell = ({ image, alt, onClick }: ImageCellProps) => {
  const [hoverStyle, setHoverStyle] = React.useState<string | null>(null)
  const [hoverText, setHoverText] = React.useState("")
  
  const imageEnter = () => {
    setHoverStyle(styles.opaqueImage);
    setHoverText(alt);
  }
  const imageLeave = () => {
    setHoverStyle(null);
    setHoverText("");
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <div 
      className={styles.cell} 
      onMouseOver={imageEnter} 
      onMouseLeave={imageLeave} 
      onFocus={imageEnter} 
      onBlur={imageLeave}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <GatsbyImage className={`${styles.masonryImg} ${hoverStyle}`} image={image} alt={alt}/>
      <span className={styles.imageText}>{hoverText}</span>
    </div>
  )
}

export default ImageCell
