import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import visitedCountries from "../data/visited-countries.json";
import visitedStates from "../data/visited-states.json";

const worldUrl = "https://raw.githubusercontent.com/mtraynham/natural-earth-topo/master/topojson/ne_50m_admin_0_map_units.json";
const statesUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface MapPosition {
  coordinates: [number, number];
  zoom: number;
}

interface GeographyNode {
  rsmKey: string
  properties: {
    name: string
    geounit: string
    sovereignt: string
  }
}

const TravelMap = () => {
  const [position, setPosition] = useState<MapPosition>({ coordinates: [0, 20], zoom: 1 });

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition((pos: MapPosition) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos: MapPosition) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  return (
    <div style={{ width: "100%", background: "transparent", position: "relative" }}>
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
                
                // If it's USA, we let the states layer handle the highlighting
                const isUSA = sovereignt === "United States of America";
                
                // Strict exact matching against the list
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
        </ZoomableGroup>
      </ComposableMap>
      
      <div style={{ 
        position: "absolute", 
        bottom: "10px", 
        right: "10px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "5px" 
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            width: "30px",
            height: "30px",
            background: "#2B2B37",
            color: "#d4fcff",
            border: "1px solid #444",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: "30px",
            height: "30px",
            background: "#2B2B37",
            color: "#d4fcff",
            border: "1px solid #444",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          aria-label="Zoom out"
        >
          -
        </button>
      </div>
    </div>
  );
};

export default TravelMap;
