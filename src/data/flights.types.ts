/**
 * Shape of src/data/flights.json — only fields shipped to the browser bundle.
 * Year-only (no calendar dates); plus airline/flight/from/to for keys and filters.
 */
export interface FlightLeg {
  year: number;
  airline: string;
  flight: string;
  from: string;
  to: string;
}

export interface FlightsDataset {
  generatedAt: string;
  source: string;
  flightCount: number;
  flights: FlightLeg[];
}
