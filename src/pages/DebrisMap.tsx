import { useState } from "react";
import { GlobeView } from "../components/GlobeView";
import { Legend } from "../components/Legend";
import { FilterPanel } from "../components/FilterPanel";
import { useDebrisObjects } from "../hooks/useDebrisObjects";
import { filterObjects, type TypeFilter } from "../utils/filterObjects";

export function DebrisMap() {
  const objects = useDebrisObjects();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const visibleObjects = filterObjects(objects, query, typeFilter);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg text-text-primary">
      <h1 className="label-tech absolute left-4 top-4 z-10">Awareness — Debris Map</h1>
      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />
      <Legend />
      {visibleObjects.length === 0 && (
        <p className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-sm text-text-secondary">
          Aucun objet ne correspond à ta recherche.
        </p>
      )}
      <div className="absolute inset-0">
        <GlobeView objects={visibleObjects} />
      </div>
    </div>
  );
}