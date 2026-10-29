import type { TypeFilter } from "../utils/filterObjects";

interface FilterPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
}

const FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "satellite", label: "Satellites" },
  { value: "debris", label: "Débris" },
];

export function FilterPanel({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
}: FilterPanelProps) {
  return (
    <div className="absolute right-4 top-4 z-10 flex w-64 flex-col gap-3 rounded-lg border border-brand-neutral/10 bg-panel/80 p-3 backdrop-blur">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Rechercher un objet..."
        className="rounded-md border border-brand-neutral/10 bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary"
      />
      <div className="flex gap-1">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onTypeFilterChange(option.value)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              typeFilter === option.value
                ? "bg-brand-secondary text-text-primary"
                : "bg-bg-secondary text-text-secondary hover:text-text-primary"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}