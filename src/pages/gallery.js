import * as React from "react"
import { graphql } from 'gatsby'
import { getImage } from 'gatsby-plugin-image'
import { FaArrowLeft } from '@react-icons/all-files/fa/FaArrowLeft'
import { FaArrowRight } from '@react-icons/all-files/fa/FaArrowRight'
import Layout from '../components/layout'
import { masonry, titleDiv, arrowDiv } from '../components/gallery.module.css'
import { container, textCenter, navbarMargin, marginSm, hiddenButton } from '../components/global.module.css'
import ImageCell from '../components/image-cell'
import ImageModal from '../components/image-modal'

const Gallery = ({ data }) => {
  const minWidth = 768;
  const getWindowWidth = () => {
    const { innerWidth: width } = window;
    return width;
  }
  const [masonryBool, setMasonryBool] = React.useState(getWindowWidth() > minWidth)
  React.useEffect(() => {
    const handleResize = () => {
      setMasonryBool(getWindowWidth() > minWidth)
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nodes = data.allMdx.nodes;
  const numPages = nodes.length;
  const [imgIndex, setImgIndex] = React.useState(0);
  const decrementIndex = () => {
    if (imgIndex === 0) {
      setImgIndex(numPages-1)
    } else {
      setImgIndex(imgIndex-1)
    }
  }
  const incrementIndex = () => {
    if (imgIndex === numPages-1) {
      setImgIndex(0)
    } else {
      setImgIndex(imgIndex+1)
    }
  }

  const [modalImage, setModalImage] = React.useState(getImage(nodes[0].frontmatter.imageList[0].hero_image));
  const [modalAlt, setModalAlt] = React.useState("");
  const [modalShow, setModalShow] = React.useState(false);
  const openModal = (img, alt) => {
    setModalImage(img);
    setModalAlt(alt);
    setModalShow(true);
  }

  const closeModal = () => {
    setModalShow(false);
  }

  return (
    <Layout pageTitle="Dongjoon Lee | Gallery" darkNavbar={true}>
      <main className={navbarMargin} id="main">
        <div className={`${container} ${titleDiv}`}>
          <div className={arrowDiv}>
            <button className={hiddenButton} onClick={decrementIndex} aria-label="move left"><FaArrowLeft size={25}/></button>
          </div>
          <div className={textCenter}>
            <h1 className={marginSm}>{nodes[imgIndex].frontmatter.title}</h1>
            <p className={marginSm}>{nodes[imgIndex].frontmatter.description}</p>
          </div>
          <div className={arrowDiv}>
            <button className={hiddenButton} onClick={incrementIndex} aria-label="move right"><FaArrowRight size={25}/></button>
          </div>
        </div>
        <section className={masonry}>
          {
            nodes[0].frontmatter.imageList.map(({hero_image, hero_image_alt, grid_row, grid_col}, index) => {
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
                  onClick={() => {openModal(image, hero_image_alt)}}
                />
              )
            })
          }
        </section>
      </main>
      {modalShow ? (<ImageModal image={modalImage} alt={modalAlt} close={closeModal}/>) : null}
    </Layout>
  )
}

export const query = graphql`
  query {
    allMdx (filter: {fileAbsolutePath: {regex: "/(gallery)/"}}) {
      nodes {
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
`

export default Gallery
