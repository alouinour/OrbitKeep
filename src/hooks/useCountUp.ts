import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value from 0 to the parsed number inside `raw` once the
 * element enters the viewport. Non-numeric characters (commas, "+", units)
 * are preserved and re-applied to the animated output.
 */
export function useCountUp(raw: string, duration = 1400) {
  const [display, setDisplay] = useState<string>(raw.replace(/[0-9]/g, "0"));
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const match = raw.match(/[\d,]+(\.\d+)?/);
    if (!match) {
      setDisplay(raw);
      return;
    }

    const numericStr = match[0].replace(/,/g, "");
    const target = parseFloat(numericStr);
    const prefix = raw.slice(0, match.index);
    const suffix = raw.slice((match.index ?? 0) + match[0].length);
    const hasComma = match[0].includes(",");
    const decimals = numericStr.includes(".") ? numericStr.split(".")[1].length : 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun.current) {
            hasRun.current = true;
            const start = performance.now();

            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = target * eased;
              const formatted = hasComma
                ? current.toLocaleString("en-US", {
                    maximumFractionDigits: decimals,
                    minimumFractionDigits: decimals,
                  })
                : current.toFixed(decimals);
              setDisplay(`${prefix}${formatted}${suffix}`);
              if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [raw, duration]);

  return { ref, display };
}
