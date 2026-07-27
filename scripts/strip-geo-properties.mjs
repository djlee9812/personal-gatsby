#!/usr/bin/env node
// Strips unused Natural Earth / us-atlas properties from vendored TopoJSON files
// to shrink the payload shipped for the homepage travel map. Only touches
// `properties` on each geometry — arcs/transform/topology are untouched.

import { readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const TARGETS = [
  {
    file: path.join(repoRoot, "static/geo/ne_50m_admin_0_map_units.json"),
    keepProperties: ["name", "geounit", "sovereignt"],
  },
  {
    file: path.join(repoRoot, "static/geo/states-10m.json"),
    keepProperties: ["name"],
  },
];

function stripProperties(properties, keepProperties) {
  const stripped = {};
  for (const key of keepProperties) {
    if (Object.hasOwn(properties, key)) {
      stripped[key] = properties[key];
    }
  }
  return stripped;
}

function stripGeometry(geometry, keepProperties) {
  if (geometry.properties) {
    geometry.properties = stripProperties(geometry.properties, keepProperties);
  }
  return geometry;
}

function stripTopology(topology, keepProperties) {
  for (const objectKey of Object.keys(topology.objects)) {
    const object = topology.objects[objectKey];
    if (Array.isArray(object.geometries)) {
      object.geometries = object.geometries.map((geometry) =>
        stripGeometry(geometry, keepProperties),
      );
    } else if (object.properties) {
      stripGeometry(object, keepProperties);
    }
  }
  return topology;
}

function formatBytes(bytes) {
  return `${bytes.toLocaleString()} bytes (${(bytes / 1024).toFixed(1)} KB)`;
}

for (const { file, keepProperties } of TARGETS) {
  const beforeSize = statSync(file).size;
  const topology = JSON.parse(readFileSync(file, "utf8"));

  stripTopology(topology, keepProperties);

  writeFileSync(file, JSON.stringify(topology));
  const afterSize = statSync(file).size;

  const relPath = path.relative(repoRoot, file);
  console.log(`${relPath}`);
  console.log(`  properties kept: ${keepProperties.join(", ")}`);
  console.log(`  before: ${formatBytes(beforeSize)}`);
  console.log(`  after:  ${formatBytes(afterSize)}`);
  console.log(
    `  saved:  ${formatBytes(beforeSize - afterSize)} (${(
      ((beforeSize - afterSize) / beforeSize) *
      100
    ).toFixed(1)}%)`,
  );
}
