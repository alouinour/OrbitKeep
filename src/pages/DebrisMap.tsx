import { GlobeView } from "../components/GlobeView";

export function DebrisMap() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <h1 className="label-tech">Awareness — Debris Map</h1>
      <GlobeView />
    </div>
  );
}