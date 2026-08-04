import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { MAP_COLOR_DEFAULTS, readMapColors } from "./map-colors.ts";

const cssPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../components/travel-map.module.css",
);

function cssMapVar(css: string, name: string): string {
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]+)\\s*;`));
  assert.ok(match, `expected ${name} hex in travel-map.module.css`);
  return match[1].toLowerCase();
}

describe("MAP_COLOR_DEFAULTS", () => {
  it("matches documented hex values", () => {
    assert.equal(MAP_COLOR_DEFAULTS.visited, "#d4fcff");
    assert.equal(MAP_COLOR_DEFAULTS.unvisited, "#2b2b37");
    assert.equal(MAP_COLOR_DEFAULTS.routeStroke, "#dcae52");
    assert.equal(MAP_COLOR_DEFAULTS.stroke, "#444");
  });

  it("matches travel-map.module.css --map-* defaults", () => {
    const css = readFileSync(cssPath, "utf8");
    assert.equal(cssMapVar(css, "--map-visited-fill"), MAP_COLOR_DEFAULTS.visited);
    assert.equal(cssMapVar(css, "--map-unvisited-fill"), MAP_COLOR_DEFAULTS.unvisited);
    assert.equal(cssMapVar(css, "--map-route-stroke"), MAP_COLOR_DEFAULTS.routeStroke);
    assert.equal(cssMapVar(css, "--map-control-border"), MAP_COLOR_DEFAULTS.stroke);
    assert.equal(cssMapVar(css, "--map-flights-on-fg"), "#f0e6c8");
  });
});

describe("readMapColors", () => {
  const mockEl = {} as Element;

  it("prefers computed --map-* values when present", () => {
    const previous = globalThis.getComputedStyle;
    try {
      globalThis.getComputedStyle = () =>
        ({
          getPropertyValue: (name: string) => {
            const values: Record<string, string> = {
              "--map-visited-fill": " #abc123 ",
              "--map-unvisited-fill": "#111111",
              "--map-route-stroke": "#222222",
              "--map-control-border": "#333333",
            };
            return values[name] ?? "";
          },
        }) as CSSStyleDeclaration;

      assert.deepEqual(readMapColors(mockEl), {
        visited: "#abc123",
        unvisited: "#111111",
        routeStroke: "#222222",
        stroke: "#333333",
      });
    } finally {
      globalThis.getComputedStyle = previous;
    }
  });

  it("falls back to defaults when computed values are empty", () => {
    const previous = globalThis.getComputedStyle;
    try {
      globalThis.getComputedStyle = () =>
        ({
          getPropertyValue: () => "",
        }) as CSSStyleDeclaration;

      assert.deepEqual(readMapColors(mockEl), MAP_COLOR_DEFAULTS);
    } finally {
      globalThis.getComputedStyle = previous;
    }
  });

  it("falls back per-field when some computed values are empty", () => {
    const previous = globalThis.getComputedStyle;
    try {
      globalThis.getComputedStyle = () =>
        ({
          getPropertyValue: (name: string) => {
            const values: Record<string, string> = {
              "--map-visited-fill": "",
              "--map-unvisited-fill": "#111111",
              "--map-route-stroke": "#222222",
              "--map-control-border": "#333333",
            };
            return values[name] ?? "";
          },
        }) as CSSStyleDeclaration;

      assert.deepEqual(readMapColors(mockEl), {
        visited: MAP_COLOR_DEFAULTS.visited,
        unvisited: "#111111",
        routeStroke: "#222222",
        stroke: "#333333",
      });
    } finally {
      globalThis.getComputedStyle = previous;
    }
  });

  it("treats whitespace-only computed values as empty", () => {
    const previous = globalThis.getComputedStyle;
    try {
      globalThis.getComputedStyle = () =>
        ({
          getPropertyValue: () => "   ",
        }) as CSSStyleDeclaration;

      assert.deepEqual(readMapColors(mockEl), MAP_COLOR_DEFAULTS);
    } finally {
      globalThis.getComputedStyle = previous;
    }
  });
});
