import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComposableMap, Geographies, Geography, Line, ZoomableGroup } from "react-simple-maps";
import visitedCountries from "../data/visited-countries.json";
import visitedStates from "../data/visited-states.json";
import flightsDataset from "../data/flights.json";
import airportCoordinates from "../data/airport-coordinates.json";
import type { FlightsDataset } from "../data/flights.types";
import { buildDrawableRoutes, type AirportCoordinatesMap } from "../lib/flight-routes";
import { TRAVEL_MAP_HEIGHT, TRAVEL_MAP_WIDTH } from "./travel-map-constants";
import { prefetchTravelGeo } from "./travel-map-geo";
import { useMatchMedia } from "../hooks/use-match-media";
import * as styles from "./travel-map.module.css";

const FLIGHTS_STORAGE_KEY = "travel-map-show-flights";

/** Fallbacks mirror defaults in travel-map.module.css until CSS vars are read. */
interface MapColors {
  visited: string;
  unvisited: string;
  routeStroke: string;
  stroke: string;
}

const MAP_COLOR_DEFAULTS: MapColors = {
  visited: "#d4fcff",
  unvisited: "#2b2b37",
  routeStroke: "#dcae52",
  stroke: "#444",
};

const MAP_COLOR_DESCRIPTION =
  "Light teal regions are places visited. Dark regions have not been visited.";
const MAP_FLIGHTS_DESCRIPTION = " Gold lines show flight routes.";

interface MapPosition {
  coordinates: [number, number];
  zoom: number;
}

interface GeographyNode {
  rsmKey: string;
  properties: {
    name: string;
    geounit: string;
    sovereignt: string;
  };
}

const typedFlights = flightsDataset as FlightsDataset;
const typedAirports = airportCoordinates as unknown as AirportCoordinatesMap;

const geographyStyle = {
  default: { outline: "none" },
  hover: { outline: "none" },
  pressed: { outline: "none" },
};

const TravelMap = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const colorDescId = useId();
  const prefersDark = useMatchMedia("(prefers-color-scheme: dark)");
  const [position, setPosition] = useState<MapPosition>({ coordinates: [0, 20], zoom: 1 });
  const [showFlights, setShowFlights] = useState(false);
  const [worldGeo, setWorldGeo] = useState<object | null>(null);
  const [statesGeo, setStatesGeo] = useState<object | null>(null);
  const [geoError, setGeoError] = useState(false);
  const [colors, setColors] = useState<MapColors>(MAP_COLOR_DEFAULTS);

  // Re-read when OS theme flips so SVG stroke stays in sync with CSS control tokens.
  // biome-ignore lint/correctness/useExhaustiveDependencies: prefersDark is the theme-change signal
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const s = getComputedStyle(el);
    const next: MapColors = {
      visited: s.getPropertyValue("--map-visited-fill").trim() || MAP_COLOR_DEFAULTS.visited,
      unvisited: s.getPropertyValue("--map-unvisited-fill").trim() || MAP_COLOR_DEFAULTS.unvisited,
      routeStroke: s.getPropertyValue("--map-route-stroke").trim() || MAP_COLOR_DEFAULTS.routeStroke,
      stroke: s.getPropertyValue("--map-control-border").trim() || MAP_COLOR_DEFAULTS.stroke,
    };
    // Skip update when CSS vars match current state (avoids a full Geography re-render).
    setColors((prev) =>
      prev.visited === next.visited &&
      prev.unvisited === next.unvisited &&
      prev.routeStroke === next.routeStroke &&
      prev.stroke === next.stroke
        ? prev
        : next,
    );
  }, [prefersDark]);

  const drawableRoutes = useMemo(
    () => (showFlights ? buildDrawableRoutes(typedFlights.flights ?? [], typedAirports) : []),
    [showFlights],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(FLIGHTS_STORAGE_KEY);
      if (stored === "true") setShowFlights(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    prefetchTravelGeo()
      .then(({ world, states }) => {
        if (cancelled) return;
        setWorldGeo(world);
        setStatesGeo(states);
      })
      .catch(() => {
        if (!cancelled) setGeoError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFlights = () => {
    setShowFlights((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(FLIGHTS_STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleZoomIn = () => {
    setPosition((pos) => {
      if (pos.zoom >= 8) return pos;
      return { ...pos, zoom: pos.zoom * 1.5 };
    });
  };

  const handleZoomOut = () => {
    setPosition((pos) => {
      if (pos.zoom <= 1) return pos;
      return { ...pos, zoom: pos.zoom / 1.5 };
    });
  };

  if (geoError) {
    return (
      <div ref={wrapRef} className={styles.wrap} role="status">
        <p className={styles.geoError}>Map geography could not be loaded.</p>
      </div>
    );
  }

  if (!worldGeo || !statesGeo) {
    return <div className={styles.slot} aria-hidden="true" />;
  }

  const colorDescription =
    MAP_COLOR_DESCRIPTION + (showFlights ? MAP_FLIGHTS_DESCRIPTION : "");

  return (
    <div ref={wrapRef} className={styles.wrap} aria-describedby={colorDescId}>
      <p id={colorDescId} className={styles.srOnly}>
        {colorDescription}
      </p>
      <ComposableMap
        projectionConfig={{ scale: 145 }}
        width={TRAVEL_MAP_WIDTH}
        height={TRAVEL_MAP_HEIGHT}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos)}
        >
          <Geographies geography={worldGeo}>
            {({ geographies }: { geographies: GeographyNode[] }) =>
              geographies.map((geo) => {
                const geounit = geo.properties.geounit;
                const sovereignt = geo.properties.sovereignt;

                const isUSA = sovereignt === "United States of America";

                const isVisited = !isUSA && visitedCountries.includes(geounit);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isVisited ? colors.visited : colors.unvisited}
                    stroke={colors.stroke}
                    strokeWidth={0.5}
                    style={geographyStyle}
                  />
                );
              })
            }
          </Geographies>

          <Geographies geography={statesGeo}>
            {({ geographies }: { geographies: GeographyNode[] }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name;
                const isVisited = visitedStates.includes(stateName);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isVisited ? colors.visited : colors.unvisited}
                    stroke={colors.stroke}
                    strokeWidth={0.5}
                    style={geographyStyle}
                  />
                );
              })
            }
          </Geographies>

          {showFlights ? (
            <g className={styles.routeLayer}>
              {drawableRoutes.map((route) => (
                <Line
                  key={route.key}
                  coordinates={route.coordinates}
                  stroke={colors.routeStroke}
                  strokeWidth={0.65}
                  strokeLinecap="round"
                  fill="transparent"
                />
              ))}
            </g>
          ) : null}
        </ZoomableGroup>
      </ComposableMap>

      <div className={styles.controlsToggle}>
        <button
          type="button"
          role="switch"
          aria-checked={showFlights}
          aria-label="Show flight routes"
          className={`${styles.flightsBtn} ${showFlights ? styles.flightsBtnOn : ""}`}
          onClick={toggleFlights}
        >
          <FontAwesomeIcon icon={["fas", "plane"]} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.controlsZoom}>
        <button type="button" className={styles.zoomBtn} onClick={handleZoomIn} aria-label="Zoom in">
          +
        </button>
        <button type="button" className={styles.zoomBtn} onClick={handleZoomOut} aria-label="Zoom out">
          −
        </button>
      </div>
    </div>
  );
};

export default TravelMap;
