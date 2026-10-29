import { TYPE_LABELS } from "../utils/objectStyle";

const LEGEND_ITEMS: { type: keyof typeof TYPE_LABELS; color: string }[] = [
  { type: "satellite", color: "#3fa66b" },
  { type: "debris", color: "#d94a4a" },
];

export function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 rounded-lg border border-brand-neutral/10 bg-panel/80 p-3 backdrop-blur">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.type} className="flex items-center gap-2 text-sm text-text-secondary">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {TYPE_LABELS[item.type]}
        </div>
      ))}
    </div>
  );
}