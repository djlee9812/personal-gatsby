import React, { useEffect, useId, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Line, ZoomableGroup } from "react-simple-maps";
import visitedCountries from "../data/visited-countries.json";
import visitedStates from "../data/visited-states.json";
import flightsDataset from "../data/flights.json";
import airportCoordinates from "../data/airport-coordinates.json";
import type { FlightsDataset } from "../data/flights.types";
import { buildDrawableRoutes, type AirportCoordinatesMap } from "../lib/flight-routes";
import * as styles from "./travel-map.module.css";

const worldUrl = "https://raw.githubusercontent.com/mtraynham/natural-earth-topo/master/topojson/ne_50m_admin_0_map_units.json";
const statesUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export const TRAVEL_MAP_HEIGHT = 400;

const FLIGHTS_STORAGE_KEY = "travel-map-show-flights";

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

const TravelMap = () => {
  const flightsLabelId = useId();
  const [position, setPosition] = useState<MapPosition>({ coordinates: [0, 20], zoom: 1 });
  const [isClient, setIsClient] = useState(false);
  const [showFlights, setShowFlights] = useState(false);

  const drawableRoutes = useMemo(
    () => buildDrawableRoutes(typedFlights.flights, typedAirports),
    [typedFlights.flights, typedAirports],
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(FLIGHTS_STORAGE_KEY);
      if (stored === "true") setShowFlights(true);
    } catch {
      /* ignore */
    }
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
    if (position.zoom >= 8) return;
    setPosition((pos: MapPosition) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos: MapPosition) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  if (!isClient) {
    return <div style={{ width: "100%", height: TRAVEL_MAP_HEIGHT, background: "transparent" }} />;
  }

  return (
    <div className={styles.wrap}>
      <ComposableMap projectionConfig={{ scale: 145 }}>
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos: { coordinates: [number, number]; zoom: number }) => setPosition(pos)}
        >
          <Geographies geography={worldUrl}>
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
                    fill={isVisited ? "#d4fcff" : "#2B2B37"}
                    stroke="#444"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          <Geographies geography={statesUrl}>
            {({ geographies }: { geographies: GeographyNode[] }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name;
                const isVisited = visitedStates.includes(stateName);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isVisited ? "#d4fcff" : "#2B2B37"}
                    stroke="#444"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
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
                  stroke="#dcae52"
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
