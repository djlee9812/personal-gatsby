import * as React from "react"
import { graphql, type PageProps, type HeadFC } from 'gatsby'
import * as globalStyles from '../components/global.module.css'
import * as galleryStyles from '../components/gallery.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Layout from '../components/layout'
import Seo from '../components/seo'
import ImageCell from '../components/image-cell'
import ImageModal from '../components/image-modal'
import {
  cloudinaryBlurPlaceholder,
  GALLERY_THUMB_OPTIONS,
  optimizeCloudinaryImage,
} from '../utils/cloudinary'

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

/** Eager-load the first row-ish of masonry thumbs (3-col desktop). */
const EAGER_THUMB_COUNT = 3

/** Soft-infinite-scroll batch size for thumbs. */
const PAGE_SIZE = 15

/**
 * html { scroll-behavior: smooth } makes scrollTo(..., behavior:"auto")
 * animate; temporarily force auto so collection switches jump instantly.
 * Prefer this over behavior:"instant" so older engines that lack that enum stay correct.
 */
function scrollToTopInstant() {
  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = "auto"
  window.scrollTo(0, 0)
  root.style.scrollBehavior = previous
}

function nodeAspectRatio(node: CloudinaryNode): number {
  if (node.width && node.height && node.width > 0 && node.height > 0) {
    return node.width / node.height
  }
  return 4 / 3
}

const Gallery = ({ data }: PageProps<Queries.GalleryQuery>) => {
  
  // Group by persisted galleryCategory (tags[0] at build time via onCreateNode).
  // Zero-maintenance: a new Cloudinary tag automatically becomes a collection.
  const collections: GalleryCollection[] = React.useMemo(() => {
    const groups: { [key: string]: CloudinaryNode[] } = {};
    
    if (!data?.allCloudinaryMedia?.nodes) return [];

    data.allCloudinaryMedia.nodes.forEach(node => {
      const category = node.fields?.galleryCategory;
      if (!category) return;
      
      if (!groups[category]) groups[category] = [];
      groups[category].push(node as CloudinaryNode);
    });

    return Object.keys(groups)
      .map(key => ({
        title: key.charAt(0).toUpperCase() + key.slice(1), 
        images: groups[key]
      })).sort((a, b) => a.title.localeCompare(b.title));
  }, [data]);

  const [galIndex, setGalIndex] = React.useState(0);
  const [imgIndex, setImgIndex] = React.useState(0);
  const [modalShow, setModalShow] = React.useState(false);
  const lightboxHistoryOpen = React.useRef(false);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  
  /**
   * renderLimit implements "Soft Infinite Scroll". 
   * To prevent the DOM from becoming heavy with hundreds of images on initial load,
   * we only render a small batch. The IntersectionObserver at the bottom 
   * increments this limit as the user scrolls.
   */
  const [renderLimit, setRenderLimit] = React.useState(PAGE_SIZE);
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
          setRenderLimit((prev) => prev + PAGE_SIZE);
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

  // Leaving /gallery while open leaves the synthetic history entry (calling
  // history.back() here races Gatsby Link and can undo the destination route).
  React.useEffect(() => {
    return () => {
      lightboxHistoryOpen.current = false;
      returnFocusRef.current = null;
    };
  }, []);

  // Handle cases where no valid Cloudinary images/tags are found.
  if (numPages === 0 || !currentCollection) {
    return (
      <Layout>
        <main className={globalStyles.navbarMargin} id="main">
          <div className={`${globalStyles.pageHeader} ${globalStyles.pageHeaderTop} ${globalStyles.textCenter}`}>
            <h1>Gallery</h1>
            <p>No tagged gallery images in the latest build. Add primary tags (e.g. Travel, Hobby) in Cloudinary, then trigger a site rebuild.</p>
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

  const goToCollection = (direction: 1 | -1) => {
    setGalIndex((prev) => (prev + direction + numPages) % numPages)
    setImgIndex(0)
    setRenderLimit(PAGE_SIZE)
    scrollToTopInstant()
  }

  const openModal = (index: number, trigger?: HTMLElement | null) => {
    if (!imgList[index]?.secure_url) return
    returnFocusRef.current = trigger ?? null
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
  const modalSrc = modalImage?.secure_url ?? ""
  const modalAspectRatio = modalImage ? nodeAspectRatio(modalImage) : 4 / 3

  return (
    <Layout>
      <main className={globalStyles.navbarMargin} id="main">
        {/* Navigation Header for Collections */}
        <div className={globalStyles.pageHeaderTop}>
          <div className={galleryStyles.titleDiv}>
            <div className={galleryStyles.arrowDiv}>
              <button className={globalStyles.hiddenButton} onClick={() => goToCollection(-1)} aria-label="Previous Collection">
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
              <button className={globalStyles.hiddenButton} onClick={() => goToCollection(1)} aria-label="Next Collection">
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
            if (!node.secure_url) return null

            const id = node.id;
            const alt = node.context?.custom?.alt || `Gallery Image ${index}`;
            const optimized = optimizeCloudinaryImage(
              node.secure_url,
              GALLERY_THUMB_OPTIONS,
            )
            const placeholderSrc = cloudinaryBlurPlaceholder(node.secure_url)
            
            return (
              <ImageCell 
                key={id} 
                src={optimized.src}
                srcSet={optimized.srcSet}
                sizes={optimized.sizes}
                width={node.width}
                height={node.height}
                alt={alt} 
                placeholderSrc={placeholderSrc}
                loading={index < EAGER_THUMB_COUNT ? "eager" : "lazy"}
                onClick={(trigger) => openModal(index, trigger)}
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
      {modalShow && modalSrc ? (
        <ImageModal
          src={modalSrc}
          alt={modalImage?.context?.custom?.alt || `Gallery Image ${imgIndex}`}
          aspectRatio={modalAspectRatio}
          placeholderSrc={cloudinaryBlurPlaceholder(modalSrc)}
          close={closeModal}
          nextImg={nextImg}
          prevImg={prevImg}
          returnFocusRef={returnFocusRef}
        />
      ) : null}
    </Layout>
  )
}

export const query = graphql`
  query Gallery {
    allCloudinaryMedia(
      sort: { created_at: DESC }
      filter: { fields: { galleryCategory: { ne: "" } } }
    ) {
      nodes {
        id
        fields {
          galleryCategory
        }
        secure_url
        width
        height
        context {
          custom {
            alt
          }
        }
      }
    }
  }
`
export const Head: HeadFC = ({ location }) => (
  <Seo title="Gallery" pathname={location.pathname} />
)

export default Gallery
