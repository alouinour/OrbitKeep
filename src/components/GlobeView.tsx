import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { mockDebrisObjects, type DebrisObject } from "../data/DebrisMock";

interface GlobeViewProps {
  objects?: DebrisObject[];
}

export function GlobeView({ objects = mockDebrisObjects }: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState(720);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setSize(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-[720px]">
      <Globe
        ref={globeRef}
        width={size}
        height={size}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        pointsData={objects}
        pointLat="lat"
        pointLng="lon"
        pointAltitude={0.01}
        pointColor={(d: any) =>
          (d as DebrisObject).type === "satellite" ? "#3FA66B" : "#E0522F"
        }
        pointRadius={0.4}
        pointLabel={(d: any) => (d as DebrisObject).nom}
      />
    </div>
  );
}