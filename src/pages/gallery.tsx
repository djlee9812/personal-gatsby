import * as React from "react"
import { graphql, PageProps, HeadFC } from 'gatsby'
import { IGatsbyImageData } from 'gatsby-plugin-image'
import * as globalStyles from '../components/global.module.css'
import * as galleryStyles from '../components/gallery.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Layout from '../components/layout'
import Seo from '../components/seo'
import ImageCell from '../components/image-cell'
import ImageModal from '../components/image-modal'

interface CloudinaryNode {
  id: string
  tags: string[]
  secure_url: string
  context?: {
    custom?: {
      alt?: string
      caption?: string
    }
  }
  thumb: IGatsbyImageData
  full: IGatsbyImageData
}

interface GalleryData {
  allCloudinaryMedia: {
    nodes: CloudinaryNode[]
  }
}

interface GalleryCollection {
  title: string
  description: string
  images: CloudinaryNode[]
}

const Gallery = ({ data }: PageProps<GalleryData>) => {
  
  // Group images by primary tag
  const collections: GalleryCollection[] = React.useMemo(() => {
    const groups: { [key: string]: CloudinaryNode[] } = {};
    
    // Safety check if data is missing
    if (!data?.allCloudinaryMedia?.nodes) return [];

    data.allCloudinaryMedia.nodes.forEach(node => {
      // Use the first tag as the category, default to "misc" if no tags
      const category = (node.tags && node.tags.length > 0) ? node.tags[0] : "misc";
      
      // Ignore images tagged with something else (like "avatar" or "blog")
      // You can refine this logic if you use many tags.
      
      if (!groups[category]) groups[category] = [];
      groups[category].push(node);
    });

    return Object.keys(groups)
      .filter(key => key !== 'misc') // Hide untagged images from gallery
      .map(key => ({
        title: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize "travel" -> "Travel"
        description: `Collection of ${key} photos`,
        images: groups[key]
      })).sort((a, b) => a.title.localeCompare(b.title));
  }, [data]);

  const [galIndex, setGalIndex] = React.useState(0);
  const [imgIndex, setImgIndex] = React.useState(0);
  const [modalShow, setModalShow] = React.useState(false);

  // Handle case with no collections
  if (collections.length === 0) {
    return (
      <Layout>
        <main className={globalStyles.navbarMargin} id="main">
          <div className={globalStyles.container}>
            <h1>Gallery</h1>
            <p>No tagged images found. Please add tags (e.g., 'travel', 'hobby') to your images in Cloudinary.</p>
          </div>
        </main>
      </Layout>
    );
  }

  const numPages = collections.length;
  const currentCollection = collections[galIndex];
  const imgList = currentCollection.images;

  const decrementIndex = () => {
    setGalIndex(prev => (prev === 0 ? numPages - 1 : prev - 1));
    setImgIndex(0); 
  }
  const incrementIndex = () => {
    setGalIndex(prev => (prev === numPages - 1 ? 0 : prev + 1));
    setImgIndex(0);
  }

  const openModal = (index: number) => {
    setImgIndex(index);
    setModalShow(true);
  }

  const closeModal = () => {
    setModalShow(false);
  }

  const nextImg = () => {
    setImgIndex(prev => (prev === imgList.length - 1 ? 0 : prev + 1));
  }

  const prevImg = () => {
    setImgIndex(prev => (prev === 0 ? imgList.length - 1 : prev - 1));
  }

  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        <div className={`${globalStyles.container} ${galleryStyles.titleDiv}`}>
          <div className={galleryStyles.arrowDiv}>
            <button className={globalStyles.hiddenButton} onClick={decrementIndex} aria-label="Previous Collection">
              <FontAwesomeIcon icon={['fas', 'arrow-left']} size="xl"/>
            </button>
          </div>
          <div className={globalStyles.textCenter}>
            <h1 className={globalStyles.marginSm}>{currentCollection.title}</h1>
            <p className={globalStyles.marginSm}>{currentCollection.description}</p>
          </div>
          <div className={galleryStyles.arrowDiv}>
            <button className={globalStyles.hiddenButton} onClick={incrementIndex} aria-label="Next Collection">
              <FontAwesomeIcon icon={['fas', 'arrow-right']} size="xl"/>
            </button>
          </div>
        </div>
        
        <section className={galleryStyles.masonry}>
          {imgList.map((node, index) => {
            const id = node.id;
            const alt = node.context?.custom?.alt || `Gallery Image ${index}`; 
            
            return (
              <ImageCell 
                key={id} 
                image={node.thumb} 
                alt={alt} 
                onClick={() => openModal(index)}
              />
            )
          })}
        </section>
      </main>
      
      {modalShow && imgList[imgIndex] ? (
        <ImageModal 
          image={imgList[imgIndex].full} 
          alt={imgList[imgIndex].context?.custom?.alt || ""} 
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
    allCloudinaryMedia(sort: {created_at: DESC}) {
      nodes {
        id
        tags
        secure_url
        context {
          custom {
            alt
            caption
          }
        }
        thumb: gatsbyImageData(
          width: 600
          placeholder: BLURRED
          layout: CONSTRAINED
        )
        full: gatsbyImageData(
          width: 1600
          placeholder: BLURRED
          layout: CONSTRAINED
        )
      }
    }
  }
`
export const Head: HeadFC = () => <Seo title="Gallery" />

export default Gallery
