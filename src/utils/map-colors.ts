export type MapColors = {
  visited: string;
  unvisited: string;
  routeStroke: string;
  stroke: string;
};

export const MAP_COLOR_DEFAULTS: MapColors = {
  visited: "#d4fcff",
  unvisited: "#2b2b37",
  routeStroke: "#dcae52",
  stroke: "#444",
};

export function readMapColors(el: Element): MapColors {
  const s = getComputedStyle(el);
  return {
    visited: s.getPropertyValue("--map-visited-fill").trim() || MAP_COLOR_DEFAULTS.visited,
    unvisited: s.getPropertyValue("--map-unvisited-fill").trim() || MAP_COLOR_DEFAULTS.unvisited,
    routeStroke: s.getPropertyValue("--map-route-stroke").trim() || MAP_COLOR_DEFAULTS.routeStroke,
    stroke: s.getPropertyValue("--map-control-border").trim() || MAP_COLOR_DEFAULTS.stroke,
  };
}
