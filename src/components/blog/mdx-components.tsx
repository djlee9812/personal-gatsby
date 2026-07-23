import BlogImage from "./image"
import { MarkdownImg } from "./image"
import Asymmetric from "./asymmetric"
import ImageGrid from "./image-grid"
import TitleBand from "./title-band"

/**
 * Shortcodes + default element overrides for blog MDX via MDXProvider.
 */
export const blogMdxComponents = {
  img: MarkdownImg,
  Image: BlogImage,
  Asymmetric,
  ImageGrid,
  TitleBand,
}

export { BlogImage as Image, MarkdownImg, Asymmetric, ImageGrid, TitleBand }
