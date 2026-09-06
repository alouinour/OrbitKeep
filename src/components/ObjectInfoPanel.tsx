import type { DebrisObject } from "../data/DebrisMock";
import { TYPE_LABELS } from "../utils/objectStyle";

interface ObjectInfoPanelProps {
  object: DebrisObject;
  onClose: () => void;
}

export function ObjectInfoPanel({ object, onClose }: ObjectInfoPanelProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10 w-72 rounded-lg border border-white/10 bg-bg/90 p-4 backdrop-blur">
      <div className="flex items-start justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{object.nom}</h2>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
      <dl className="mt-2 space-y-1 text-xs text-text-secondary">
        <div className="flex justify-between">
          <dt>Type</dt>
          <dd>{TYPE_LABELS[object.type]}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Altitude</dt>
          <dd>{object.altitude ? `${Math.round(object.altitude)} km` : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Latitude</dt>
          <dd>{object.lat.toFixed(2)}°</dd>
        </div>
        <div className="flex justify-between">
          <dt>Longitude</dt>
          <dd>{object.lon.toFixed(2)}°</dd>
        </div>
      </dl>
    </div>
  );
}