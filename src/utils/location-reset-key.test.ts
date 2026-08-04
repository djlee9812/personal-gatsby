import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { locationResetKey } from "./location-reset-key.ts"

describe("locationResetKey", () => {
  it("returns pathname when search and hash are empty", () => {
    assert.equal(
      locationResetKey({ pathname: "/gallery/", search: "", hash: "" }),
      "/gallery/",
    )
  })

  it("includes query string", () => {
    assert.equal(
      locationResetKey({
        pathname: "/blog/",
        search: "?page=2",
        hash: "",
      }),
      "/blog/?page=2",
    )
  })

  it("includes hash", () => {
    assert.equal(
      locationResetKey({
        pathname: "/",
        search: "",
        hash: "#travel-map",
      }),
      "/#travel-map",
    )
  })

  it("includes search and hash together", () => {
    assert.equal(
      locationResetKey({
        pathname: "/projects/",
        search: "?ref=nav",
        hash: "#top",
      }),
      "/projects/?ref=nav#top",
    )
  })
})
