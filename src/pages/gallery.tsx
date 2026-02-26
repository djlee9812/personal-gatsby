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

/**
 * Type alias for a single Cloudinary media node from the generated GraphQL types.
 */
type CloudinaryNode = NonNullable<Queries.GalleryQuery["allCloudinaryMedia"]["nodes"]>[0]

/**
 * Represents a logical group of images (e.g., "Travel", "Hobby") based on Cloudinary tags.
 */
interface GalleryCollection {
  title: string
  images: CloudinaryNode[]
}

const Gallery = ({ data }: PageProps<Queries.GalleryQuery>) => {
  
  // Group images by their primary tag (tags[0]). 
  // This allows the gallery to be "zero-maintenance": simply adding a new tag 
  // in Cloudinary will automatically create a new collection slide here.
  const collections: GalleryCollection[] = React.useMemo(() => {
    const groups: { [key: string]: CloudinaryNode[] } = {};
    
    if (!data?.allCloudinaryMedia?.nodes) return [];

    data.allCloudinaryMedia.nodes.forEach(node => {
      // images without tags are grouped under 'misc' and later filtered out.
      const category = (node.tags && node.tags.length > 0) ? node.tags[0]! : "misc";
      
      if (!groups[category]) groups[category] = [];
      groups[category].push(node as CloudinaryNode);
    });

    return Object.keys(groups)
      .filter(key => key !== 'misc') 
      .map(key => ({
        title: key.charAt(0).toUpperCase() + key.slice(1), 
        images: groups[key]
      })).sort((a, b) => a.title.localeCompare(b.title));
  }, [data]);

  const [galIndex, setGalIndex] = React.useState(0);
  const [imgIndex, setImgIndex] = React.useState(0);
  const [modalShow, setModalShow] = React.useState(false);
  
  /**
   * renderLimit implements "Soft Infinite Scroll". 
   * To prevent the DOM from becoming heavy with hundreds of images on initial load,
   * we only render a small batch. The IntersectionObserver at the bottom 
   * increments this limit as the user scrolls.
   */
  const [renderLimit, setRenderLimit] = React.useState(15);
  const loaderRef = React.useRef<HTMLDivElement>(null);

  const numPages = collections.length;
  const currentCollection = numPages > 0 ? collections[galIndex] : null;

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRenderLimit((prev) => prev + 15);
        }
      },
      { rootMargin: "200px" } 
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [currentCollection]); 

  // Handle cases where no valid Cloudinary images/tags are found.
  if (numPages === 0 || !currentCollection) {
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

  const imgList = currentCollection.images;
  const visibleImages = imgList.slice(0, renderLimit);

  const decrementIndex = () => {
    setGalIndex(prev => (prev === 0 ? numPages - 1 : prev - 1));
    setImgIndex(0); 
    setRenderLimit(15); 
  }
  const incrementIndex = () => {
    setGalIndex(prev => (prev === numPages - 1 ? 0 : prev + 1));
    setImgIndex(0);
    setRenderLimit(15); 
  }

  const openModal = (index: number) => {
    setImgIndex(index);
    setModalShow(true);
  }

  const closeModal = () => setModalShow(false);

  const nextImg = () => {
    setImgIndex(prev => (prev === imgList.length - 1 ? 0 : prev + 1));
  }

  const prevImg = () => {
    setImgIndex(prev => (prev === 0 ? imgList.length - 1 : prev - 1));
  }

  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        {/* Navigation Header for Collections */}
        <div className={galleryStyles.titleDiv}>
          <div className={galleryStyles.arrowDiv}>
            <button className={globalStyles.hiddenButton} onClick={decrementIndex} aria-label="Previous Collection">
              <FontAwesomeIcon icon={['fas', 'arrow-left']} size="xl"/>
            </button>
          </div>
          <div className={globalStyles.textCenter}>
            <h1 className={globalStyles.marginSm}>{currentCollection.title}</h1>
          </div>
          <div className={galleryStyles.arrowDiv}>
            <button className={globalStyles.hiddenButton} onClick={incrementIndex} aria-label="Next Collection">
              <FontAwesomeIcon icon={['fas', 'arrow-right']} size="xl"/>
            </button>
          </div>
        </div>
        
        {/* Masonry Grid */}
        <section className={galleryStyles.masonry}>
          {visibleImages.map((node, index) => {
            const id = node.id;
            const alt = node.context?.custom?.alt || `Gallery Image ${index}`; 
            
            return (
              <ImageCell 
                key={id} 
                image={node.thumb as IGatsbyImageData} 
                alt={alt} 
                onClick={() => openModal(index)}
              />
            )
          })}
        </section>
        
        {/* IntersectionObserver trigger for loading more images */}
        {renderLimit < imgList.length && (
          <div ref={loaderRef} style={{ height: "1px", width: "100%" }} aria-hidden="true" />
        )}
      </main>
      
      {/* Lightbox Modal */}
      {modalShow && imgList[imgIndex] ? (
        <ImageModal 
          image={imgList[imgIndex].full as IGatsbyImageData} 
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
  query Gallery {
    allCloudinaryMedia(sort: {created_at: DESC}) {
      nodes {
        id
        tags
        secure_url
        context {
          custom {
            alt
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
