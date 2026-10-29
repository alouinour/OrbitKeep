import type { DebrisObject, DebrisType } from "../data/DebrisMock";

export type TypeFilter = "all" | DebrisType;

export function filterObjects(
  objects: DebrisObject[],
  query: string,
  typeFilter: TypeFilter
): DebrisObject[] {
  const normalizedQuery = query.trim().toLowerCase();

  return objects.filter((object) => {
    const matchesType = typeFilter === "all" || object.type === typeFilter;
    const matchesQuery =
      normalizedQuery === "" || object.nom.toLowerCase().includes(normalizedQuery);
    return matchesType && matchesQuery;
  });
}