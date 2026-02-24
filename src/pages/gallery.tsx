import * as React from "react"
import { graphql, PageProps, HeadFC } from 'gatsby'
import { getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import * as globalStyles from '../components/global.module.css'
import * as galleryStyles from '../components/gallery.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Layout from '../components/layout'
import Seo from '../components/seo'
import ImageCell from '../components/image-cell'
import ImageModal from '../components/image-modal'

const minWidth = 768;

interface ImageListItem {
  hero_image: {
    childImageSharp: {
      thumb: IGatsbyImageData
      full: IGatsbyImageData
    }
  }
  hero_image_alt: string
  grid_row: string
  grid_col: string
}

interface GalleryNode {
  childMdx: {
    frontmatter: {
      title: string
      description: string
      imageList: ImageListItem[]
    }
    id: string
  }
}

interface GalleryData {
  allFile: {
    nodes: GalleryNode[]
  }
}

const Gallery = ({ data }: PageProps<GalleryData>) => {
  
  const [masonryBool, setMasonryBool] = React.useState(false)
  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
    
    // Set initial state
    setMasonryBool(mql.matches);

    // Modern browsers support addEventListener on MediaQueryList
    const handler = (e: MediaQueryListEvent) => setMasonryBool(e.matches);
    mql.addEventListener('change', handler);
    
    return () => mql.removeEventListener('change', handler);
  }, []);

  const nodes = data.allFile.nodes;
  const numPages = nodes.length;
  const [galIndex, setGalIndex] = React.useState(0);
  const [imgIndex, setImgIndex] = React.useState(0);
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

  const node = nodes[galIndex]?.childMdx;
  if (!node) return null;

  const imgList = node.frontmatter.imageList;

  const openModal = (index: number) => {
    setImgIndex(index)
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
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        <div className={`${globalStyles.container} ${galleryStyles.titleDiv}`}>
          <div className={galleryStyles.arrowDiv}>
            <button className={globalStyles.hiddenButton} onClick={decrementIndex} aria-label="move left"><FontAwesomeIcon icon="arrow-left" size="xl"/></button>
          </div>
          <div className={globalStyles.textCenter}>
            <h1 className={globalStyles.marginSm}>{node.frontmatter.title}</h1>
            <p className={globalStyles.marginSm}>{node.frontmatter.description}</p>
          </div>
          <div className={galleryStyles.arrowDiv}>
            <button className={globalStyles.hiddenButton} onClick={incrementIndex} aria-label="move right"><FontAwesomeIcon icon="arrow-right" size="xl"/></button>
          </div>
        </div>
        <section className={galleryStyles.masonry}>
          {
            imgList.map(({hero_image, hero_image_alt, grid_row, grid_col}, index) => {
              const image = hero_image.childImageSharp.thumb;
              const id = "cell" + index.toString();
              if (!image) return null;
              return (
                <ImageCell 
                  key={id} 
                  image={image} 
                  alt={hero_image_alt} 
                  masonryBool={masonryBool} 
                  gridRow={grid_row} 
                  gridCol={grid_col}
                  onClick={() => {openModal(index)}}
                />
              )
            })
          }
        </section>
      </main>
      {modalShow && imgList[imgIndex] ? (
        <ImageModal 
          image={imgList[imgIndex]!.hero_image.childImageSharp.full} 
          alt={imgList[imgIndex]!.hero_image_alt} 
          close={closeModal} 
          nextImg={nextImg} 
          prevImg={prevImg}
        />
      ) : null}
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
                  thumb: gatsbyImageData(
                    width: 600,
                    placeholder: BLURRED,
                    formats: [AUTO, WEBP]
                  )
                  full: gatsbyImageData(
                    width: 1600,
                    placeholder: BLURRED,
                    formats: [AUTO, WEBP]
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
export const Head: HeadFC = () => <Seo title="Gallery" />

export default Gallery
