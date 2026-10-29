import { useEffect, useState } from "react";
import { mockDebrisObjects, type DebrisObject } from "../data/DebrisMock";
import { fetchDebrisObjects } from "../services/debrisApi";

export function useDebrisObjects(): DebrisObject[] {
  const [objects, setObjects] = useState<DebrisObject[]>(mockDebrisObjects);

  useEffect(() => {
    fetchDebrisObjects()
      .then(setObjects)
      .catch((err) => {
        console.error("Live debris fetch failed, staying on mock data:", err);
      });
  }, []);

  return objects;
}