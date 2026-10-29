import type { DebrisObject } from "../data/DebrisMock";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function fetchDebrisObjects(): Promise<DebrisObject[]> {
  const response = await fetch(`${API_BASE_URL}/api/debris`);
  if (!response.ok) {
    throw new Error(`Failed to fetch debris objects: ${response.status}`);
  }
  return response.json();
}