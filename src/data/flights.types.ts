/** One leg from a Flighty export after stripping sensitive columns (see scripts/flighty-export-to-json.mjs). */
export interface FlightLeg {
  date: string;
  airline: string;
  flight: string;
  from: string;
  to: string;
  aircraftType: string | null;
  /** ISO local datetime from Flighty "Gate Departure (Scheduled)" */
  departureScheduled: string | null;
  departureActual: string | null;
  /** ISO local datetime from Flighty "Gate Arrival (Scheduled)" */
  arrivalScheduled: string | null;
  arrivalActual: string | null;
}

export interface FlightsDataset {
  generatedAt: string;
  source: string;
  sourceFile: string;
  flightCount: number;
  flights: FlightLeg[];
}
