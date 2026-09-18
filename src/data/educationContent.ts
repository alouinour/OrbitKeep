import type { DebrisType } from "./DebrisMock";

interface EducationEntry {
  title: string;
  body: string;
}

export const EDUCATION_BY_TYPE: Record<DebrisType, EducationEntry> = {
  satellite: {
    title: "Qu'est-ce qu'un satellite actif ?",
    body: "Un satellite actif est opérationnel et contrôlé depuis le sol. Il peut ajuster son orbite pour éviter les collisions et sera, en fin de vie, désorbité ou déplacé vers une orbite cimetière.",
  },
  debris: {
    title: "Qu'est-ce qu'un débris spatial ?",
    body: "Un débris est un objet artificiel en orbite qui n'a plus d'utilité ni de contrôle : étage de fusée usé, satellite hors service, ou fragment issu d'une collision ou d'une explosion. Il représente un risque de collision pour les objets encore actifs.",
  },
};

interface AltitudeBand {
  label: string;
  maxKm: number;
  note: string;
}

const ALTITUDE_BANDS: AltitudeBand[] = [
  { label: "LEO (orbite basse)", maxKm: 2000, note: "La majorité des satellites et débris s'y trouvent. Une collision y génère un nuage de fragments qui peut rester en orbite des décennies." },
  { label: "MEO (orbite moyenne)", maxKm: 35000, note: "Zone utilisée notamment par les satellites de positionnement (type GPS)." },
  { label: "GEO (orbite géostationnaire)", maxKm: 36000, note: "À cette altitude, un satellite reste fixe au-dessus du même point de la Terre — utilisé pour les télécoms et la météo." },
];

export function getAltitudeNote(altitudeKm?: number): string | null {
  if (altitudeKm == null) return null;
  const band = ALTITUDE_BANDS.find((b) => altitudeKm <= b.maxKm);
  return band ? `${band.label} — ${band.note}` : "Orbite très haute, au-delà des zones standards.";
}