import type { DebrisObject } from "../data/DebrisMock";

const EARTH_RADIUS_KM = 6371;
export const PROXIMITY_THRESHOLD_KM = 200;

function toCartesian(obj: DebrisObject): { x: number; y: number; z: number } {
  const r = EARTH_RADIUS_KM + (obj.altitude ?? 0);
  const latRad = (obj.lat * Math.PI) / 180;
  const lonRad = (obj.lon * Math.PI) / 180;
  return {
    x: r * Math.cos(latRad) * Math.cos(lonRad),
    y: r * Math.cos(latRad) * Math.sin(lonRad),
    z: r * Math.sin(latRad),
  };
}

function distanceKm(a: DebrisObject, b: DebrisObject): number {
  const pa = toCartesian(a);
  const pb = toCartesian(b);
  return Math.sqrt((pa.x - pb.x) ** 2 + (pa.y - pb.y) ** 2 + (pa.z - pb.z) ** 2);
}

/** Renvoie l'ensemble des id d'objets ayant au moins un autre objet à moins de thresholdKm. */
export function findObjectsAtRisk(
  objects: DebrisObject[],
  thresholdKm: number = PROXIMITY_THRESHOLD_KM
): Set<string> {
  const atRisk = new Set<string>();
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      if (distanceKm(objects[i], objects[j]) <= thresholdKm) {
        atRisk.add(objects[i].id);
        atRisk.add(objects[j].id);
      }
    }
  }
  return atRisk;
}