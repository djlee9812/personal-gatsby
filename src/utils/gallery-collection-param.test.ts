import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  collectionIndexFromSearch,
  collectionSlug,
} from "./gallery-collection-param.ts"

const collections = [{ title: "Hobby" }, { title: "Travel" }]

describe("collectionSlug", () => {
  it("trims and lowercases", () => {
    assert.equal(collectionSlug("Hobby"), "hobby")
    assert.equal(collectionSlug(" Travel "), "travel")
  })
})

describe("collectionIndexFromSearch", () => {
  it("returns 0 when search is missing or empty", () => {
    assert.equal(collectionIndexFromSearch("", collections), 0)
    assert.equal(collectionIndexFromSearch("?", collections), 0)
  })

  it("matches ?c= case-insensitively", () => {
    assert.equal(collectionIndexFromSearch("?c=hobby", collections), 0)
    assert.equal(collectionIndexFromSearch("?c=Travel", collections), 1)
    assert.equal(collectionIndexFromSearch("?c=TRAVEL", collections), 1)
  })

  it("returns 0 for unknown or blank c", () => {
    assert.equal(collectionIndexFromSearch("?c=foo", collections), 0)
    assert.equal(collectionIndexFromSearch("?c=", collections), 0)
    assert.equal(collectionIndexFromSearch("?c=   ", collections), 0)
  })

  it("ignores other params and uses the first c", () => {
    assert.equal(collectionIndexFromSearch("?ref=nav&c=travel", collections), 1)
    assert.equal(collectionIndexFromSearch("?c=travel&c=hobby", collections), 1)
  })

  it("returns 0 when there are no collections", () => {
    assert.equal(collectionIndexFromSearch("?c=travel", []), 0)
  })
})
