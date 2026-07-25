import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  countPostWords,
  getNeighbors,
  shouldShowTopNav,
  toNeighbor,
  TOP_NAV_MIN_WORDS,
} from "./blog-post-nav.ts"

describe("toNeighbor", () => {
  it("requires slug only", () => {
    assert.deepEqual(toNeighbor({ slug: "a" }), { slug: "a", title: "" })
    assert.deepEqual(toNeighbor({ slug: "a", title: "Hello" }), {
      slug: "a",
      title: "Hello",
    })
    assert.equal(toNeighbor(null), null)
    assert.equal(toNeighbor({ slug: "" }), null)
    assert.equal(toNeighbor({ slug: "   " }), null)
  })
})

describe("getNeighbors", () => {
  const posts = [
    { slug: "newest", title: "N" },
    { slug: "mid", title: "M" },
    { slug: "oldest", title: "O" },
  ]

  it("returns only older for the newest post", () => {
    assert.deepEqual(getNeighbors(posts, 0), {
      newer: null,
      older: { slug: "mid", title: "M" },
    })
  })

  it("returns both for a middle post", () => {
    assert.deepEqual(getNeighbors(posts, 1), {
      newer: { slug: "newest", title: "N" },
      older: { slug: "oldest", title: "O" },
    })
  })

  it("returns only newer for the oldest post", () => {
    assert.deepEqual(getNeighbors(posts, 2), {
      newer: { slug: "mid", title: "M" },
      older: null,
    })
  })

  it("handles a single-post list", () => {
    assert.deepEqual(getNeighbors([{ slug: "only", title: "One" }], 0), {
      newer: null,
      older: null,
    })
  })

  it("keeps a neighbor that has slug but no title", () => {
    assert.deepEqual(
      getNeighbors([{ slug: "a", title: "A" }, { slug: "b" }], 0),
      {
        newer: null,
        older: { slug: "b", title: "" },
      }
    )
  })
})

describe("countPostWords", () => {
  it("returns 0 for empty input", () => {
    assert.equal(countPostWords(""), 0)
    assert.equal(countPostWords(null), 0)
    assert.equal(countPostWords("   "), 0)
  })

  it("counts plain prose", () => {
    assert.equal(countPostWords("one two three"), 3)
  })

  it("ignores import lines, tags, and urls", () => {
    const mdx = `import X from "./x"

Hello <Asymmetric>world</Asymmetric> see https://example.com/foo bar
`
    assert.equal(countPostWords(mdx), 4) // Hello world see bar
  })
})

describe("shouldShowTopNav", () => {
  it("gates on TOP_NAV_MIN_WORDS", () => {
    assert.equal(shouldShowTopNav(TOP_NAV_MIN_WORDS - 1), false)
    assert.equal(shouldShowTopNav(TOP_NAV_MIN_WORDS), true)
  })
})
