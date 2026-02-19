import * as React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'
import { cell, masonryImg, imageText, opaqueImage } from './image-cell.module.css'

const ImageCell = ({ image, alt, masonryBool, gridRow, gridCol, onClick }) => {
  const [hoverStyle, setHoverStyle] = React.useState(null)
  const [hoverText, setHoverText] = React.useState("")
  const [masonryStyle, setMasonryStyle] = React.useState({})
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
  
  
  const handleKeyDown = (e) => {
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