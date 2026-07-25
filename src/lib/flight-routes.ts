import { geoInterpolate } from "d3-geo";
import type { FlightLeg } from "../data/flights.types";

/** Lon/lat in degrees (GeoJSON order). */
export type LonLat = [number, number];

export type AirportCoordinatesMap = Record<string, LonLat>;

export interface DrawableFlightRoute {
  key: string;
  coordinates: LonLat[];
  leg: FlightLeg;
}

const GREAT_CIRCLE_SEGMENTS = 36;

/** Trim + uppercase IATA airport code. */
export function normalizeAirportCode(code: string): string {
  return String(code ?? "")
    .trim()
    .toUpperCase();
}

function isValidIataCode(code: string): boolean {
  return code.length === 3;
}

/**
 * Samples points along the geodesic between two WGS84 coordinates (degrees).
 */
export function greatCircleCoordinates(from: LonLat, to: LonLat, segments = GREAT_CIRCLE_SEGMENTS): LonLat[] {
  const interpolate = geoInterpolate(from, to);
  const coords: LonLat[] = [];
  for (let i = 0; i <= segments; i++) {
    const p = interpolate(i / segments);
    coords.push([p[0], p[1]]);
  }
  return coords;
}

function legKey(leg: FlightLeg, index: number): string {
  return `${leg.year}|${leg.airline}|${leg.flight}|${leg.from}|${leg.to}|${index}`;
}

/**
 * Turns flight legs into GeoJSON-style LineString coordinate arrays for react-simple-maps `Line`.
 * Skips legs when either endpoint is missing from `lookup`.
 */
export function buildDrawableRoutes(legs: FlightLeg[], lookup: AirportCoordinatesMap): DrawableFlightRoute[] {
  if (!Array.isArray(legs)) return [];

  const routes: DrawableFlightRoute[] = [];

  legs.forEach((leg, index) => {
    const fromCode = normalizeAirportCode(leg.from);
    const toCode = normalizeAirportCode(leg.to);
    if (!isValidIataCode(fromCode) || !isValidIataCode(toCode)) return;
    if (fromCode === toCode) return;

    const from = lookup[fromCode];
    const to = lookup[toCode];
    if (!from || !to) return;

    routes.push({
      key: legKey(leg, index),
      coordinates: greatCircleCoordinates(from, to),
      leg,
    });
  });

  return routes;
}
