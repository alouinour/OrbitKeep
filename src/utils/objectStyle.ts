import type { DebrisObject, DebrisType } from "../data/DebrisMock";

// Hex en dur ici (pas var(--color-success)) : react-globe.gl passe ces
// valeurs directement au parsing couleur de three.js, qui ne résout pas
// les custom properties CSS. Les hex sont synchronisés avec src/index.css.
const COLORS: Record<DebrisType, string> = {
  satellite: "#3fa66b", // --color-success
  debris: "#d94a4a", // --color-danger
};

export const TYPE_LABELS: Record<DebrisType, string> = {
  satellite: "Satellite",
  debris: "Débris",
};

export function getObjectColor(object: DebrisObject): string {
  return COLORS[object.type];
}

export function getObjectRadius(object: DebrisObject): number {
  return object.type === "satellite" ? 0.35 : 0.4;
}