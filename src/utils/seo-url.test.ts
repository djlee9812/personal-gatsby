import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { buildSeoUrl } from "./seo-url.ts"

describe("buildSeoUrl", () => {
  it("joins siteUrl and pathname", () => {
    assert.equal(
      buildSeoUrl("https://example.com", "/blog/hi/"),
      "https://example.com/blog/hi/"
    )
  })

  it("falls back when pathname or siteUrl is missing", () => {
    assert.equal(buildSeoUrl("https://example.com"), "https://example.com")
    assert.equal(buildSeoUrl("https://example.com", ""), "https://example.com")
    assert.equal(buildSeoUrl("https://example.com", null), "https://example.com")
    assert.equal(buildSeoUrl(null, "/gallery/"), "/gallery/")
    assert.equal(buildSeoUrl(undefined, undefined), "")
  })
})
