import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildCloudinaryUrl,
  cloudinaryBlurPlaceholder,
  GALLERY_THUMB_OPTIONS,
  optimizeCloudinaryImage,
} from "./cloudinary.ts"

const BASE =
  "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg"

describe("buildCloudinaryUrl", () => {
  it("returns input when URL does not match Cloudinary upload pattern", () => {
    const external = "https://example.com/photo.jpg"
    assert.equal(buildCloudinaryUrl(external, "f_auto,q_auto,w_800"), external)
  })

  it("inserts transform immediately after /upload/", () => {
    assert.equal(
      buildCloudinaryUrl(BASE, "f_auto,q_auto,w_800"),
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1234567890/sample.jpg"
    )
  })

  it("strips leading transform segments before applying new transform", () => {
    const withTransform =
      "https://res.cloudinary.com/demo/image/upload/f_auto,w_800/v1234567890/sample.jpg"
    assert.equal(
      buildCloudinaryUrl(withTransform, "f_auto,q_auto,w_1200"),
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200/v1234567890/sample.jpg"
    )
  })
})

describe("optimizeCloudinaryImage", () => {
  it("returns non-Cloudinary URLs unchanged", () => {
    const external = "https://cdn.example.com/assets/hero.png"
    assert.deepEqual(optimizeCloudinaryImage(external), {
      src: external,
      sizes: undefined,
    })
  })

  it("returns empty or falsy src unchanged", () => {
    assert.deepEqual(optimizeCloudinaryImage(""), { src: "", sizes: undefined })
    assert.deepEqual(optimizeCloudinaryImage(undefined as unknown as string), {
      src: undefined,
      sizes: undefined,
    })
  })

  it("builds f_auto,q_auto,w_* src and srcSet with default widths", () => {
    const result = optimizeCloudinaryImage(BASE)

    assert.equal(
      result.src,
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1234567890/sample.jpg"
    )
    assert.equal(
      result.srcSet,
      [
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_480/v1234567890/sample.jpg 480w",
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1234567890/sample.jpg 800w",
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200/v1234567890/sample.jpg 1200w",
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1600/v1234567890/sample.jpg 1600w",
      ].join(", ")
    )
  })

  it("strips existing transform segments before re-applying defaults", () => {
    const withTransform =
      "https://res.cloudinary.com/demo/image/upload/f_auto,w_800/v1234567890/sample.jpg"

    const result = optimizeCloudinaryImage(withTransform)

    assert.equal(
      result.src,
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1234567890/sample.jpg"
    )
    assert.match(result.srcSet ?? "", /f_auto,q_auto,w_480\//)
    assert.doesNotMatch(result.srcSet ?? "", /f_auto,w_800\/f_auto/)
  })

  it("passes through sizes from options without changing non-Cloudinary URLs", () => {
    const sizes = "(max-width: 768px) 100vw, 800px"
    assert.deepEqual(optimizeCloudinaryImage("https://example.com/x.jpg", { sizes }), {
      src: "https://example.com/x.jpg",
      sizes,
    })
  })

  it("honors custom width and widths (projects / blog layout options)", () => {
    const result = optimizeCloudinaryImage(BASE, {
      width: 480,
      widths: [480, 800],
      sizes: "(max-width: 600px) 100vw, 480px",
    })

    assert.equal(
      result.src,
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_480/v1234567890/sample.jpg",
    )
    assert.equal(
      result.srcSet,
      [
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_480/v1234567890/sample.jpg 480w",
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1234567890/sample.jpg 800w",
      ].join(", "),
    )
    assert.equal(result.sizes, "(max-width: 600px) 100vw, 480px")
    assert.doesNotMatch(result.srcSet ?? "", /w_1200|w_1600/)
  })
})

describe("cloudinaryBlurPlaceholder", () => {
  it("returns non-Cloudinary URLs unchanged", () => {
    const external = "https://example.com/photo.jpg"
    assert.equal(cloudinaryBlurPlaceholder(external), external)
  })

  it("returns empty src unchanged", () => {
    assert.equal(cloudinaryBlurPlaceholder(""), "")
  })

  it("builds a small blurred Cloudinary URL", () => {
    assert.equal(
      cloudinaryBlurPlaceholder(BASE),
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_40,e_blur:1000/v1234567890/sample.jpg",
    )
  })

  it("honors custom blur width", () => {
    assert.equal(
      cloudinaryBlurPlaceholder(BASE, 24),
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_24,e_blur:1000/v1234567890/sample.jpg",
    )
  })
})

describe("GALLERY_THUMB_OPTIONS", () => {
  it("produces masonry-sized srcSet without large breakpoints", () => {
    const result = optimizeCloudinaryImage(BASE, GALLERY_THUMB_OPTIONS)

    assert.equal(
      result.src,
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/v1234567890/sample.jpg",
    )
    assert.equal(
      result.srcSet,
      [
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_300/v1234567890/sample.jpg 300w",
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/v1234567890/sample.jpg 600w",
      ].join(", "),
    )
    assert.equal(result.sizes, "(max-width: 767px) 100vw, 33vw")
    assert.doesNotMatch(result.srcSet ?? "", /w_1200|w_1600/)
  })
})
