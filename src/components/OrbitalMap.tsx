import { useMemo } from "react";
import { riskClass } from "../data/riskMonitorData";
import type { MapObject } from "../types/riskMonitor";

// FIX: le backend renvoie TOUS les objets stockés (potentiellement >10 000).
// Un <div> + <button> par objet fait ramer le navigateur → on plafonne, objets à risque en priorité.
const MAX_MARKERS = 2000;

function x(longitude: number) {
  return `${((longitude + 180) / 360) * 92 + 4}%`;
}

function y(latitude: number) {
  return `${((90 - latitude) / 180) * 84 + 8}%`;
}

export function OrbitalMap({ objects, total }: { objects: MapObject[]; total?: number }) {
  const visible = useMemo(() => {
    if (objects.length <= MAX_MARKERS) return objects;
    const atRisk = objects.filter((o) => o.risk_level);
    const others = objects.filter((o) => !o.risk_level).slice(0, Math.max(0, MAX_MARKERS - atRisk.length));
    return [...others, ...atRisk];
  }, [objects]);

  // FIX: quand total vaut 0 (chargement initial), la comparaison était toujours vraie
  // → "1234 OBJECTS PLOTTED" s'affichait même quand le backend n'avait pas encore répondu.
  // On utilise undefined pour distinguer "pas encore chargé" de "0 objet stocké".
  const knownTotal = (total !== undefined && total > 0) ? Math.max(total, objects.length) : objects.length;

  return (
    <div className="map" aria-label="Orbital object map">
      <span className="map-grid-label label-tech">GROUND TRACK / CURRENT POSITIONS</span>
      {visible.map((object) => (
        <div
          key={object.id}
          className={`marker ${object.risk_level ? riskClass[object.risk_level] : ""}`}
          style={{ left: x(object.longitude), top: y(object.latitude) }}
        >
          <button
            type="button"
            className="marker-button"
            aria-label={`${object.name} — ${object.altitude_km.toFixed(0)} km`}
            title={`${object.name} · ${object.altitude_km.toFixed(0)} km${object.risk_level ? ` · ${object.risk_level} risk` : ""}`}
          />
          <span className="marker-tooltip" aria-hidden="true">
            {object.name} · {object.altitude_km.toFixed(0)} km
            {object.risk_level && <> · <strong>{object.risk_level}</strong></>}
          </span>
        </div>
      ))}
      <span className="map-coords mono">
        {/* FIX: utilise knownTotal pour éviter le faux "X OBJECTS PLOTTED" au chargement initial */}
        {visible.length === knownTotal
          ? `${visible.length} OBJECTS PLOTTED`
          : `${visible.length} / ${knownTotal} OBJECTS PLOTTED`}
      </span>
    </div>
  );
}