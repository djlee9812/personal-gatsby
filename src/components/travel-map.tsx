import React, { useEffect, useId, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Line, ZoomableGroup } from "react-simple-maps";
import visitedCountries from "../data/visited-countries.json";
import visitedStates from "../data/visited-states.json";
import flightsDataset from "../data/flights.json";
import airportCoordinates from "../data/airport-coordinates.json";
import type { FlightsDataset } from "../data/flights.types";
import { buildDrawableRoutes, type AirportCoordinatesMap } from "../lib/flight-routes";
import { TRAVEL_MAP_HEIGHT } from "./travel-map-constants";
import * as styles from "./travel-map.module.css";

const worldUrl = "/geo/ne_50m_admin_0_map_units.json";
const statesUrl = "/geo/states-10m.json";

const FLIGHTS_STORAGE_KEY = "travel-map-show-flights";
const VISITED_FILL = "#d4fcff";
const UNVISITED_FILL = "#2B2B37";
const ROUTE_STROKE = "#dcae52";

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

async function loadGeography(url: string): Promise<object> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return res.json();
}

const TravelMap = () => {
  const flightsLabelId = useId();
  const legendId = useId();
  const [position, setPosition] = useState<MapPosition>({ coordinates: [0, 20], zoom: 1 });
  const [showFlights, setShowFlights] = useState(false);
  const [worldGeo, setWorldGeo] = useState<object | null>(null);
  const [statesGeo, setStatesGeo] = useState<object | null>(null);
  const [geoError, setGeoError] = useState(false);

  const drawableRoutes = useMemo(
    () => (showFlights ? buildDrawableRoutes(typedFlights.flights ?? [], typedAirports) : []),
    [showFlights, typedFlights.flights, typedAirports],
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
    Promise.all([loadGeography(worldUrl), loadGeography(statesUrl)])
      .then(([world, states]) => {
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
      <div className={styles.wrap} role="status">
        <p className={styles.geoError}>Map geography could not be loaded.</p>
      </div>
    );
  }

  if (!worldGeo || !statesGeo) {
    return <div style={{ width: "100%", height: TRAVEL_MAP_HEIGHT, background: "transparent" }} aria-hidden="true" />;
  }

  return (
    <div className={styles.wrap} aria-describedby={legendId}>
      <ComposableMap projectionConfig={{ scale: 145 }}>
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
                    fill={isVisited ? VISITED_FILL : UNVISITED_FILL}
                    stroke="#444"
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
                    fill={isVisited ? VISITED_FILL : UNVISITED_FILL}
                    stroke="#444"
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
                  stroke={ROUTE_STROKE}
                  strokeWidth={0.65}
                  strokeLinecap="round"
                  fill="transparent"
                />
              ))}
            </g>
          ) : null}
        </ZoomableGroup>
      </ComposableMap>

      <ul id={legendId} className={styles.legend} aria-label="Map legend">
        <li className={styles.legendItem}>
          <span
            className={`${styles.legendSwatch} ${styles.legendSwatchVisited}`}
            style={{ background: VISITED_FILL }}
            aria-hidden
          />
          Visited
        </li>
        <li className={styles.legendItem}>
          <span
            className={`${styles.legendSwatch} ${styles.legendSwatchUnvisited}`}
            style={{ background: UNVISITED_FILL }}
            aria-hidden
          />
          Not visited
        </li>
        {showFlights ? (
          <li className={styles.legendItem}>
            <span
              className={`${styles.legendSwatch} ${styles.legendSwatchRoute}`}
              style={{ borderTopColor: ROUTE_STROKE }}
              aria-hidden
            />
            Flight routes
          </li>
        ) : null}
      </ul>

      <div className={styles.controlsToggle}>
        <div className={styles.toggleControl}>
          <span id={flightsLabelId} className={styles.toggleTitle}>
            Flights
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showFlights}
            aria-labelledby={flightsLabelId}
            className={`${styles.switchTrack} ${showFlights ? styles.switchTrackOn : ""}`}
            onClick={toggleFlights}
          >
            <span className={styles.switchThumb} aria-hidden />
          </button>
        </div>
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
