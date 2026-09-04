import { useEffect, useRef } from "react";
import Globe from "react-globe.gl";

export function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ altitude: 2.5 }, 0);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-[720px]">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
      />
    </div>
  );
}