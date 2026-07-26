const CLOUDINARY_UPLOAD =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i;

const TRANSFORM_SEGMENT = /^(?:[a-z]+_[^,/\s]+(?:,[a-z]+_[^,/\s]+)*)\//i;

const DEFAULT_WIDTHS = [480, 800, 1200, 1600];

export type CloudinaryImageOptions = {
  /** Target display width hint for the default `src`. */
  width?: number;
  /** Widths included in `srcSet`. */
  widths?: number[];
  /** `sizes` attribute; defaults based on layout size. */
  sizes?: string;
};

function stripExistingTransforms(pathAfterUpload: string): string {
  let rest = pathAfterUpload;
  // Drop one or more leading transform segments (e.g. f_auto,q_auto/ or w_800/)
  while (TRANSFORM_SEGMENT.test(rest)) {
    rest = rest.replace(TRANSFORM_SEGMENT, "");
  }
  return rest;
}

function isCloudinaryUploadUrl(src: string): boolean {
  return CLOUDINARY_UPLOAD.test(src);
}

/**
 * Build a Cloudinary delivery URL with the given transform string
 * inserted immediately after `/upload/`.
 */
export function buildCloudinaryUrl(src: string, transform: string): string {
  const match = src.match(CLOUDINARY_UPLOAD);
  if (!match) return src;
  const [, prefix, rest] = match;
  return `${prefix}${transform}/${stripExistingTransforms(rest)}`;
}

/**
 * Optimize a remote image URL for the blog.
 * Cloudinary URLs get `f_auto,q_auto` plus responsive width transforms.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function optimizeCloudinaryImage(
  src: string,
  options: CloudinaryImageOptions = {}
): { src: string; srcSet?: string; sizes?: string } {
  if (!src || !isCloudinaryUploadUrl(src)) {
    return { src, sizes: options.sizes };
  }

  const width = options.width ?? 800;
  const widths = options.widths ?? DEFAULT_WIDTHS;
  const uniqueWidths = Array.from(new Set([...widths, width])).sort(
    (a, b) => a - b
  );

  const defaultSrc = buildCloudinaryUrl(src, `f_auto,q_auto,w_${width}`);
  const srcSet = uniqueWidths
    .map((w) => `${buildCloudinaryUrl(src, `f_auto,q_auto,w_${w}`)} ${w}w`)
    .join(", ");

  return {
    src: defaultSrc,
    srcSet,
    sizes: options.sizes,
  };
}
