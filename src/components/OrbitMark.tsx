interface OrbitMarkProps {
  className?: string;
}

/**
 * Abstract orbital mark used in the navbar and footer as OrbitKeep's icon.
 * Two intersecting ellipses with a fixed body and a single moving node —
 * a small, literal reference to orbital mechanics rather than a generic logo.
 */
export function OrbitMark({ className = "h-6 w-6" }: OrbitMarkProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="28" cy="34" r="16" fill="currentColor" />
      <path d="M6 22C22 4 50 7 58 28C66 50 45 63 24 58C15 56 9 51 5 45" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M45 22L57 6M45 22L62 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
