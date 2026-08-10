import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { resolveGalleryCategory } from "./gallery-category.ts"

describe("resolveGalleryCategory", () => {
  it("returns null for missing, empty, or whitespace-only first tags", () => {
    assert.equal(resolveGalleryCategory(null), null)
    assert.equal(resolveGalleryCategory(undefined), null)
    assert.equal(resolveGalleryCategory([]), null)
    assert.equal(resolveGalleryCategory([null, "Travel"]), null)
    assert.equal(resolveGalleryCategory(["", "Hobby"]), null)
    assert.equal(resolveGalleryCategory(["   "]), null)
    assert.equal(resolveGalleryCategory(["   ", "Travel"]), null)
  })

  it("returns null for the misc tag", () => {
    assert.equal(resolveGalleryCategory(["misc"]), null)
    assert.equal(resolveGalleryCategory(["misc", "Travel"]), null)
  })

  it("returns trimmed tags[0] only (case-sensitive)", () => {
    assert.equal(resolveGalleryCategory(["Travel"]), "Travel")
    assert.equal(resolveGalleryCategory(["Hobby", "Travel"]), "Hobby")
    assert.equal(resolveGalleryCategory(["Misc"]), "Misc")
    assert.equal(resolveGalleryCategory([" Travel "]), "Travel")
  })
})
