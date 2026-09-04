import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { mockDebrisObjects, type DebrisObject } from "../data/DebrisMock";

interface GlobeViewProps {
  objects?: DebrisObject[];
}

export function GlobeView({ objects = mockDebrisObjects }: GlobeViewProps) {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0);
    }
  }, []);

  return (
    <Globe
      ref={globeRef}
      width={dimensions.width}
      height={dimensions.height}
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
  );
}