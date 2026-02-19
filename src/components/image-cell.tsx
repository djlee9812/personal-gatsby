import * as React from 'react'
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'
// @ts-ignore
import { cell, masonryImg, imageText, opaqueImage } from './image-cell.module.css'

interface ImageCellProps {
  image: IGatsbyImageData
  alt: string
  masonryBool?: boolean
  gridRow?: string
  gridCol?: string
  onClick: () => void
}

const ImageCell = ({ image, alt, masonryBool, gridRow, gridCol, onClick }: ImageCellProps) => {
  const [hoverStyle, setHoverStyle] = React.useState<string | null>(null)
  const [hoverText, setHoverText] = React.useState("")
  const [masonryStyle, setMasonryStyle] = React.useState<React.CSSProperties>({})
  
  const imageEnter = () => {
    setHoverStyle(opaqueImage);
    setHoverText(alt);
  }
  const imageLeave = () => {
    setHoverStyle(null);
    setHoverText("");
  }
  
  React.useEffect(() => {
    if (masonryBool) {
      setMasonryStyle({
        "gridColumn": gridRow,
        "gridRow": gridCol
      })
    } else {
      setMasonryStyle({});
    }
  }, [masonryBool, gridRow, gridCol])
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <div 
      className={cell} 
      onMouseOver={imageEnter} 
      onMouseLeave={imageLeave} 
      onFocus={imageEnter} 
      onBlur={imageLeave}
      style={masonryStyle}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <GatsbyImage className={`${masonryImg} ${hoverStyle}`} image={image} alt={alt}/>
      <span className={imageText}>{hoverText}</span>
    </div>
  )
}

export default ImageCell
