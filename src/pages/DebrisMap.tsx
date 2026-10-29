import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { GlobeView } from "../components/GlobeView";
import { Legend } from "../components/Legend";
import { FilterPanel } from "../components/FilterPanel";
import { ObjectInfoPanel } from "../components/ObjectInfoPanel";
import { useDebrisObjects } from "../hooks/useDebrisObjects";
import { filterObjects, type TypeFilter } from "../utils/filterObjects";
import { findObjectsAtRisk } from "../utils/proximity";
import type { DebrisObject } from "../data/DebrisMock";

export function DebrisMap() {
  const objects = useDebrisObjects();

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedObject, setSelectedObject] =
    useState<DebrisObject | null>(null);

  const visibleObjects = filterObjects(objects, query, typeFilter);

  // Calculé sur la liste complète (pas filtrée) :
  // un risque de proximité reste réel même si l'objet est filtré/caché.
  const atRiskIds = useMemo(
    () => findObjectsAtRisk(objects),
    [objects]
  );

  const ringsData = useMemo(
    () =>
      visibleObjects
        .filter((o) => atRiskIds.has(o.id))
        .map((o) => ({
          lat: o.lat,
          lng: o.lon,
        })),
    [visibleObjects, atRiskIds]
  );

  const goToDashboard = () => {
    window.location.href = "/";
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg text-text-primary">

      {/* Top left controls */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-3">

        {/* Back button */}
        <button
          type="button"
          onClick={goToDashboard}
          aria-label="Back to Dashboard"
          className="
            group
            flex items-center gap-2
            rounded-xl
            border border-white/10
            bg-black/30
            px-3 py-2
            text-text-secondary
            backdrop-blur-md
            transition-all duration-200
            hover:border-brand-secondary/40
            hover:bg-white/5
            hover:text-text-primary
          "
        >
          <ArrowLeft
            className="
              h-4 w-4
              transition-transform duration-200
              group-hover:-translate-x-0.5
            "
          />

          <span className="text-xs font-medium">
            Dashboard
          </span>
        </button>

        {/* Page title */}
        <h1 className="label-tech">
          Awareness — Debris Map
        </h1>
      </div>

      {/* Filters */}
      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {/* Legend */}
      <Legend />

      {/* Empty state */}
      {visibleObjects.length === 0 && (
        <p className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-sm text-text-secondary">
          Aucun objet ne correspond à ta recherche.
        </p>
      )}

      {/* Selected object */}
      {selectedObject && (
        <ObjectInfoPanel
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      )}

      {/* Globe */}
      <div className="absolute inset-0">
        <GlobeView
          objects={visibleObjects}
          onObjectClick={setSelectedObject}
          ringsData={ringsData}
        />
      </div>
    </div>
  );
}