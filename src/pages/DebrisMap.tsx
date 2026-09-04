import { GlobeView } from "../components/GlobeView";

export function DebrisMap() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg text-text-primary">
      <h1 className="label-tech absolute left-4 top-4 z-10">Awareness — Debris Map</h1>
      <div className="absolute inset-0">
        <GlobeView />
      </div>
    </div>
  );
}