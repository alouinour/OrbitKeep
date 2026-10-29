export type DebrisType = "satellite" | "debris";

export interface DebrisObject {
  id: string;
  nom: string;
  type: DebrisType;
  lat: number;
  lon: number;
  altitude?: number;
}

export const mockDebrisObjects: DebrisObject[] = [
  { id: "1", nom: "ISS (ZARYA)", type: "satellite", lat: 51.6, lon: -0.1, altitude: 408 },
  { id: "2", nom: "STARLINK-1007", type: "satellite", lat: 10.2, lon: 45.3, altitude: 550 },
  { id: "3", nom: "COSMOS 1408 DEB", type: "debris", lat: -30.5, lon: 120.7, altitude: 480 },
  { id: "4", nom: "FENGYUN 1C DEB", type: "debris", lat: 60.1, lon: -75.4, altitude: 850 },
  { id: "5", nom: "HUBBLE SPACE TELESCOPE", type: "satellite", lat: 28.5, lon: -80.6, altitude: 540 },
];