import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { assertTopojson } from "../components/travel-map-geo.ts"

describe("assertTopojson", () => {
  it("accepts a minimal valid TopoJSON object", () => {
    const topo = { type: "Topology", objects: { layer: {} } }
    assert.doesNotThrow(() => assertTopojson(topo, "/geo/test.json"))
  })

  it("rejects non-objects and payloads without objects", () => {
    assert.throws(() => assertTopojson(null, "/geo/test.json"), /expected object/)
    assert.throws(() => assertTopojson([], "/geo/test.json"), /missing objects/)
    assert.throws(() => assertTopojson({ type: "Topology" }, "/geo/test.json"), /missing objects/)
    assert.throws(() => assertTopojson({ objects: null }, "/geo/test.json"), /missing objects/)
    assert.throws(() => assertTopojson({ objects: [] }, "/geo/test.json"), /missing objects/)
  })
})
