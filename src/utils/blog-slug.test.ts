import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { findDuplicateSlugs, normalizeBlogSlug } from "./blog-slug.ts"

describe("normalizeBlogSlug", () => {
  it("trims and rejects empty or whitespace-only values", () => {
    assert.equal(normalizeBlogSlug("hello"), "hello")
    assert.equal(normalizeBlogSlug("  hello  "), "hello")
    assert.equal(normalizeBlogSlug(""), null)
    assert.equal(normalizeBlogSlug("   "), null)
    assert.equal(normalizeBlogSlug(null), null)
    assert.equal(normalizeBlogSlug(undefined), null)
  })
})

describe("findDuplicateSlugs", () => {
  it("returns only slugs that appear more than once", () => {
    assert.deepEqual(findDuplicateSlugs(["a", "b", "a", "c", "b"]), ["a", "b"])
    assert.deepEqual(findDuplicateSlugs(["a", "b"]), [])
    assert.deepEqual(findDuplicateSlugs([]), [])
  })
})
