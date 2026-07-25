import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildDrawableRoutes,
  greatCircleCoordinates,
  normalizeAirportCode,
  type AirportCoordinatesMap,
} from "./flight-routes.ts"
import type { FlightLeg } from "../data/flights.types.ts"

const lookup: AirportCoordinatesMap = {
  SFO: [-122.375, 37.618999],
  JFK: [-73.7789, 40.639801],
  LAX: [-118.408, 33.942501],
}

function leg(partial: Partial<FlightLeg> & Pick<FlightLeg, "from" | "to">): FlightLeg {
  return {
    year: 2024,
    airline: "UA",
    flight: "1",
    ...partial,
  }
}

describe("normalizeAirportCode", () => {
  it("trims and uppercases", () => {
    assert.equal(normalizeAirportCode("  sfo "), "SFO")
    assert.equal(normalizeAirportCode("jfk"), "JFK")
  })
})

describe("buildDrawableRoutes", () => {
  it("returns [] when legs is not an array", () => {
    assert.deepEqual(buildDrawableRoutes(null as unknown as FlightLeg[], lookup), [])
    assert.deepEqual(buildDrawableRoutes(undefined as unknown as FlightLeg[], lookup), [])
    assert.deepEqual(buildDrawableRoutes({} as unknown as FlightLeg[], lookup), [])
  })

  it("skips same-airport legs after normalize", () => {
    const routes = buildDrawableRoutes(
      [leg({ from: "sfo", to: "SFO" }), leg({ from: "SFO", to: "JFK" })],
      lookup,
    )
    assert.equal(routes.length, 1)
    assert.equal(routes[0].leg.from, "SFO")
    assert.equal(routes[0].leg.to, "JFK")
  })

  it("skips invalid, ICAO, or missing IATA endpoints", () => {
    const routes = buildDrawableRoutes(
      [
        leg({ from: "SF", to: "JFK" }),
        leg({ from: "", to: "JFK" }),
        leg({ from: "KSFO", to: "JFK" }),
        leg({ from: "SFO", to: "XXX" }),
        leg({ from: "SFO", to: "LAX" }),
      ],
      lookup,
    )
    assert.equal(routes.length, 1)
    assert.equal(routes[0].leg.to, "LAX")
  })

  it("builds great-circle coordinates for valid legs", () => {
    const routes = buildDrawableRoutes([leg({ from: "SFO", to: "JFK" })], lookup)
    assert.equal(routes.length, 1)
    assert.ok(routes[0].coordinates.length > 2)
    assert.deepEqual(routes[0].coordinates[0], lookup.SFO)
    const end = routes[0].coordinates.at(-1)!
    assert.ok(Math.abs(end[0] - lookup.JFK[0]) < 1e-9)
    assert.ok(Math.abs(end[1] - lookup.JFK[1]) < 1e-9)
  })
})

describe("greatCircleCoordinates", () => {
  it("returns endpoints inclusive for the requested segment count", () => {
    const coords = greatCircleCoordinates(lookup.SFO, lookup.JFK, 4)
    assert.equal(coords.length, 5)
    assert.deepEqual(coords[0], lookup.SFO)
    assert.ok(Math.abs(coords[4][0] - lookup.JFK[0]) < 1e-9)
    assert.ok(Math.abs(coords[4][1] - lookup.JFK[1]) < 1e-9)
  })
})
