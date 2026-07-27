import * as React from "react"
import { graphql, type PageProps, type HeadFC } from 'gatsby'
import * as globalStyles from '../components/global.module.css'
import * as galleryStyles from '../components/gallery.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Layout from '../components/layout'
import Seo from '../components/seo'
import ImageCell from '../components/image-cell'
import { getSrc } from 'gatsby-plugin-image'
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
  /** Prevents double history.back() when FocusTrap onDeactivate re-enters closeModal. */
  const lightboxHistoryOpen = React.useRef(false);
  
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
  const [collectionAnnouncement, setCollectionAnnouncement] = React.useState("");
  const skipInitialCollectionAnnounce = React.useRef(true);

  // Announce collection changes only — skip the initial mount so SPA entry
  // isn't double-announced with the visible heading/counter.
  React.useEffect(() => {
    if (!currentCollection || numPages === 0) return;
    if (skipInitialCollectionAnnounce.current) {
      skipInitialCollectionAnnounce.current = false;
      return;
    }
    setCollectionAnnouncement(
      `${currentCollection.title} collection, ${galIndex + 1} of ${numPages}`,
    );
  }, [galIndex, currentCollection, numPages]);

  // Re-bind when the active collection changes (loader node remounts).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — loader remounts per collection
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

  // Browser back closes the lightbox. Popstate already consumed the history
  // entry — only clear React state (never history.back() here).
  React.useEffect(() => {
    if (!modalShow) return;

    const handlePopState = () => {
      lightboxHistoryOpen.current = false;
      setModalShow(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [modalShow]);

  // Handle cases where no valid Cloudinary images/tags are found.
  if (numPages === 0 || !currentCollection) {
    return (
      <Layout>
        <main className={globalStyles.navbarMargin} id="main">
          <div className={`${globalStyles.pageHeader} ${globalStyles.pageHeaderTop} ${globalStyles.textCenter}`}>
            <h1>Gallery</h1>
            <p>No tagged images found. Add tags (e.g. travel, hobby) to your images in Cloudinary.</p>
          </div>
          <div className={globalStyles.container}>
            <p>No images to display.</p>
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
    if (!imgList[index]?.secure_url) return
    setImgIndex(index);
    setModalShow(true);
    // Push a history entry so the back button closes the modal instead of
    // navigating away from the gallery page.
    if (!lightboxHistoryOpen.current) {
      lightboxHistoryOpen.current = true;
      window.history.pushState({ galleryLightbox: true }, "");
    }
  }

  const closeModal = () => {
    setModalShow(false);
    // Only pop the entry we pushed — and only once (FocusTrap onDeactivate
    // can re-enter closeModal before popstate clears history.state).
    if (lightboxHistoryOpen.current) {
      lightboxHistoryOpen.current = false;
      window.history.back();
    }
  };

  const stepModalIndex = (direction: 1 | -1) => {
    setImgIndex((prev) => {
      const len = imgList.length
      if (len === 0) return prev
      for (let step = 1; step <= len; step++) {
        const next = (prev + direction * step + len * step) % len
        if (imgList[next]?.secure_url) return next
      }
      return prev
    })
  }

  const nextImg = () => stepModalIndex(1)
  const prevImg = () => stepModalIndex(-1)

  const modalImage = modalShow ? imgList[imgIndex] : null
  const modalThumb = modalImage?.thumb ?? null
  const modalAspectRatio =
    modalThumb?.width && modalThumb?.height
      ? modalThumb.width / modalThumb.height
      : 4 / 3

  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        {/* Navigation Header for Collections */}
        <div className={galleryStyles.pageHeaderWrap}>
          <div className={galleryStyles.titleDiv}>
            <div className={galleryStyles.arrowDiv}>
              <button className={globalStyles.hiddenButton} onClick={decrementIndex} aria-label="Previous Collection">
                <FontAwesomeIcon icon={['fas', 'arrow-left']} size="xl"/>
              </button>
            </div>
            <div className={`${globalStyles.textCenter} ${globalStyles.pageHeader}`}>
              <h1 key={currentCollection.title}>{currentCollection.title}</h1>
              <p className={galleryStyles.collectionCounter}>
                {galIndex + 1} / {numPages}
              </p>
            </div>
            <div className={galleryStyles.arrowDiv}>
              <button className={globalStyles.hiddenButton} onClick={incrementIndex} aria-label="Next Collection">
                <FontAwesomeIcon icon={['fas', 'arrow-right']} size="xl"/>
              </button>
            </div>
          </div>
          {/* Visually hidden: announces collection changes (not initial load). */}
          <div aria-live="polite" className={globalStyles.srOnly}>
            {collectionAnnouncement}
          </div>
        </div>
        
        {/* Masonry Grid */}
        <section className={galleryStyles.masonry}>
          {visibleImages.map((node, index) => {
            if (!node.thumb || !node.secure_url) return null

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
        
        {/* IntersectionObserver trigger for loading more images */}
        {renderLimit < imgList.length && (
          <div ref={loaderRef} style={{ height: "1px", width: "100%" }} aria-hidden="true" />
        )}
      </main>
      
      {/* Lightbox Modal */}
      {modalShow && modalImage?.secure_url ? (
        <ImageModal
          src={modalImage.secure_url ?? ""}
          alt={modalImage.context?.custom?.alt || `Gallery Image ${imgIndex}`}
          aspectRatio={modalAspectRatio}
          placeholderSrc={modalThumb ? getSrc(modalThumb) : undefined}
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
      }
    }
  }
`
export const Head: HeadFC = ({ location }) => (
  <Seo title="Gallery" pathname={location.pathname} />
)

export default Gallery
