#!/usr/bin/env node
/**
 * Builds src/data/airport-coordinates.json from unique IATA codes in flights.json
 * using data/airports-iata-master.json (IATA → [longitude, latitude], GeoJSON order).
 *
 * Master file was generated from the OpenFlights airports.dat snapshot; regenerate
 * by downloading https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
 * and parsing IATA + coordinates (see repo history or a one-off script).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function main() {
  const flightsPath = path.join(ROOT, "src", "data", "flights.json");
  const masterPath = path.join(ROOT, "data", "airports-iata-master.json");
  const outPath = path.join(ROOT, "src", "data", "airport-coordinates.json");

  if (!fs.existsSync(flightsPath)) {
    console.error(`Missing ${path.relative(ROOT, flightsPath)}. Run flighty-export-to-json first.`);
    process.exit(1);
  }
  if (!fs.existsSync(masterPath)) {
    console.error(`Missing ${path.relative(ROOT, masterPath)}.`);
    process.exit(1);
  }

  /** @type {{ flights?: unknown }} */
  const dataset = JSON.parse(fs.readFileSync(flightsPath, "utf8"));
  /** @type {Record<string, [number, number]>} */
  const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));

  if (!Array.isArray(dataset.flights)) {
    console.error(`${path.relative(ROOT, flightsPath)} must contain a flights array.`);
    process.exit(1);
  }

  const codes = new Set();
  for (const leg of dataset.flights) {
    const from = String(leg?.from ?? "").trim().toUpperCase();
    const to = String(leg?.to ?? "").trim().toUpperCase();
    if (from.length === 3) codes.add(from);
    if (to.length === 3) codes.add(to);
  }

  /** @type {Record<string, [number, number]>} */
  const out = {};
  const missing = [];

  for (const code of codes) {
    const coords = master[code];
    if (!coords) missing.push(code);
    else out[code] = coords;
  }

  if (missing.length > 0) {
    console.error(
      `Missing coordinates for ${missing.length} IATA code(s): ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${Object.keys(out).length} airports to ${path.relative(ROOT, outPath)} (${codes.size} codes referenced)`,
  );
}

main();
