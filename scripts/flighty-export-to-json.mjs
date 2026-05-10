#!/usr/bin/env node
/**
 * Reads a Flighty CSV export from data/private/ (or a path argument / FLIGHTY_CSV_PATH)
 * and writes public-safe JSON to src/data/flights.json.
 *
 * Omits: PNR, seat, cabin, notes, tail number, terminals/gates, Flighty internal IDs.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

/** @param {string} text */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  const len = text.length;

  while (i < len) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  row.push(field);
  if (row.length > 1 || field.length > 0) {
    rows.push(row);
  }
  return rows;
}

/** @param {string} s */
function trimOrNull(s) {
  const t = String(s ?? "").trim();
  return t === "" ? null : t;
}

/** @param {Record<string, string>} row */
function rowToLeg(row) {
  const iso = (key) => trimOrNull(row[key]);

  return {
    date: String(row.Date ?? "").trim(),
    airline: String(row.Airline ?? "").trim(),
    flight: String(row.Flight ?? "").trim(),
    from: String(row.From ?? "").trim(),
    to: String(row.To ?? "").trim(),
    aircraftType: iso("Aircraft Type Name"),
    departureScheduled: iso("Gate Departure (Scheduled)"),
    departureActual: iso("Gate Departure (Actual)"),
    arrivalScheduled: iso("Gate Arrival (Scheduled)"),
    arrivalActual: iso("Gate Arrival (Actual)"),
  };
}

function findDefaultCsv() {
  const dir = path.join(ROOT, "data", "private");
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^FlightyExport.*\.csv$/i.test(f))
    .map((f) => ({ f, p: path.join(dir, f), m: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  return files[0]?.p ?? null;
}

function main() {
  const argPath = process.argv[2];
  const envPath = process.env.FLIGHTY_CSV_PATH;
  const inputPath = path.resolve(
    argPath || envPath || findDefaultCsv() || "",
  );

  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error(
      "No Flighty CSV found. Place FlightyExport*.csv under data/private/, set FLIGHTY_CSV_PATH, or pass a path:\n" +
        "  node scripts/flighty-export-to-json.mjs /path/to/FlightyExport.csv",
    );
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const rows = parseCsv(text);
  if (rows.length < 2) {
    console.error("CSV has no data rows.");
    process.exit(1);
  }

  const headers = rows[0].map((h) => String(h).trim());
  const flights = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.every((c) => String(c).trim() === "")) continue;
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    flights.push(rowToLeg(row));
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: "FlightyExport",
    sourceFile: path.basename(inputPath),
    flightCount: flights.length,
    flights,
  };

  const outPath = path.join(ROOT, "src", "data", "flights.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Wrote ${flights.length} flights to ${path.relative(ROOT, outPath)}`);
}

main();
