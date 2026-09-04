import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { motionEnterInitial } from "./use-allow-motion.ts"

describe("motionEnterInitial", () => {
  it("stays visible during SSR when useReducedMotion is still null", () => {
    assert.equal(motionEnterInitial(false, null), false)
  })

  it("stays visible before hydrate even when motion will be allowed", () => {
    assert.equal(motionEnterInitial(false, false), false)
  })

  it("uses hidden enter only after hydrate when motion is allowed", () => {
    assert.equal(motionEnterInitial(true, false), "hidden")
  })

  it("skips hidden enter when the user prefers reduced motion", () => {
    assert.equal(motionEnterInitial(true, true), false)
    assert.equal(motionEnterInitial(false, true), false)
  })
})
