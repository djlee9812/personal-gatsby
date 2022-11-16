import * as React from "react"
import { graphql } from 'gatsby'
import { getImage } from 'gatsby-plugin-image'
import { FaArrowLeft } from '@react-icons/all-files/fa/FaArrowLeft'
import { FaArrowRight } from '@react-icons/all-files/fa/FaArrowRight'
import Layout from '../components/layout'
import Seo from '../components/seo'
import { masonry, titleDiv, arrowDiv } from '../components/gallery.module.css'
import { container, textCenter, navbarMargin, marginSm, hiddenButton } from '../components/global.module.css'
import ImageCell from '../components/image-cell'
import ImageModal from '../components/image-modal'

const Gallery = ({ data }) => {
  const minWidth = 768;
  
  const [masonryBool, setMasonryBool] = React.useState(false)
  React.useEffect(() => {
    const getWindowWidth = () => {
      const { innerWidth: width } = window;
      return width;
    }
    setMasonryBool(getWindowWidth() > minWidth);
    const handleResize = () => {
      setMasonryBool(getWindowWidth() > minWidth)
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nodes = data.allFile.nodes;
  const numPages = nodes.length;
  const [galIndex, setGalIndex] = React.useState(0);
  const [imgIndex, setImgIndex] = React.useState(0);
  // const [modalImage, setModalImage] = React.useState(getImage(nodes[imgIndex].childMdx.frontmatter.imageList[imgIndex].hero_image));
  // const [modalAlt, setModalAlt] = React.useState("");
  const [modalShow, setModalShow] = React.useState(false);

  const decrementIndex = () => {
    if (galIndex === 0) {
      setGalIndex(numPages-1)
    } else {
      setGalIndex(galIndex-1)
    }
  }
  const incrementIndex = () => {
    if (galIndex === numPages-1) {
      setGalIndex(0)
    } else {
      setGalIndex(galIndex+1)
    }
  }

  const node = nodes[galIndex].childMdx;
  const imgList = node.frontmatter.imageList;

  const openModal = (index, img, alt) => {
    setImgIndex(index)
    // setModalImage(img);
    // setModalAlt(alt);
    setModalShow(true);
  }

  const closeModal = () => {
    setModalShow(false);
  }

  const nextImg = () => {
    if (imgIndex === imgList.length-1) {
      setImgIndex(0)
    } else {
      setImgIndex(imgIndex+1)
      console.log(imgIndex)
    }
  }

  const prevImg = () => {
    if (imgIndex === 0) {
      setImgIndex(imgList.length-1)
    } else {
      setImgIndex(imgIndex-1)
    }
  }

  return (
    <Layout darkNavbar={true}>
      <main className={navbarMargin} id="main">
        <div className={`${container} ${titleDiv}`}>
          <div className={arrowDiv}>
            <button className={hiddenButton} onClick={decrementIndex} aria-label="move left"><FaArrowLeft size={25}/></button>
          </div>
          <div className={textCenter}>
            <h1 className={marginSm}>{node.frontmatter.title}</h1>
            <p className={marginSm}>{node.frontmatter.description}</p>
          </div>
          <div className={arrowDiv}>
            <button className={hiddenButton} onClick={incrementIndex} aria-label="move right"><FaArrowRight size={25}/></button>
          </div>
        </div>
        <section className={masonry}>
          {
            imgList.map(({hero_image, hero_image_alt, grid_row, grid_col}, index) => {
              const image = getImage(hero_image);
              const id = "cell" + index.toString();
              return (
                <ImageCell 
                  id={id} 
                  key={id} 
                  image={image} 
                  alt={hero_image_alt} 
                  masonryBool={masonryBool} 
                  gridRow={grid_row} 
                  gridCol={grid_col}
                  onClick={() => {openModal(index, image, hero_image_alt)}}
                />
              )
            })
          }
        </section>
      </main>
      {modalShow ? (<ImageModal image={getImage(imgList[imgIndex].hero_image)} alt={imgList[imgIndex].hero_image_alt} close={closeModal} nextImg={nextImg} prevImg={prevImg}/>) : null}
    </Layout>
  )
}

export const query = graphql`
  query {
    allFile(
      filter: {sourceInstanceName: {eq: "gallery"}}
    ) {
      nodes {
        childMdx {
          frontmatter {
            title
            description
            imageList {
              hero_image {
                childImageSharp {
                  gatsbyImageData(
                    placeholder: DOMINANT_COLOR,
                    formats: [AUTO, WEBP, AVIF]
                  )
                }
              } 
              hero_image_alt
              grid_row
              grid_col
            }
          }
          id
        }
      }
    }
  }
`
export const Head = () => <Seo title="Gallery" />

export default Gallery
