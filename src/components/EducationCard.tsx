import type { DebrisObject } from "../data/DebrisMock";
import { EDUCATION_BY_TYPE, getAltitudeNote } from "../data/educationContent";

interface EducationCardProps {
  object: DebrisObject;
}

export function EducationCard({ object }: EducationCardProps) {
  const entry = EDUCATION_BY_TYPE[object.type];
  const altitudeNote = getAltitudeNote(object.altitude);

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {entry.title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary">{entry.body}</p>
      {altitudeNote && (
        <p className="mt-2 text-xs leading-relaxed text-text-secondary/80">{altitudeNote}</p>
      )}
    </div>
  );
}