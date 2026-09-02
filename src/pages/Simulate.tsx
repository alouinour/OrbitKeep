import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Gauge, Info, LoaderCircle, Rocket, Sparkles } from "lucide-react";

type FormValues = {
  altitude_km: string;
  dry_mass_kg: string;
  fuel_mass_kg: string;
  specific_impulse_s: string;
};

type DisposalOption = {
  method: string;
  description: string;
  status: string;
  delta_v_m_s: number | null;
  fuel_required_kg: number | null;
  pollution: { value: number; label: string };
  suitability_score: number;
  explanation: string;
};

type SimulationResponse = {
  simulation: {
    reference_reentry_delta_v_m_s: number;
    reference_reentry_fuel_kg: number;
    specific_impulse_s: number;
    assumptions: string[];
  };
  disposal_options: DisposalOption[];
  recommendation: { method: string | null; reason: string };
};

const initialValues: FormValues = {
  altitude_km: "700",
  dry_mass_kg: "500",
  fuel_mass_kg: "42",
  specific_impulse_s: "220",
};

const methodLabels: Record<string, string> = {
  atmospheric_reentry: "Atmospheric re-entry",
  ocean_fall: "Controlled ocean fall",
  moon_impact: "Lunar impact",
  graveyard_orbit: "Graveyard orbit",
};

function formatNumber(value: number | null, suffix = "") {
  return value === null ? "—" : `${value.toFixed(value < 10 ? 2 : 0)}${suffix}`;
}

function localEstimate(values: FormValues): SimulationResponse {
  const altitude = Number(values.altitude_km);
  const dryMass = Number(values.dry_mass_kg);
  const fuelMass = Number(values.fuel_mass_kg);
  const isp = Number(values.specific_impulse_s) || 220;
  const deltaV = Math.max(80, Math.min(420, 160 + (altitude - 400) * 0.28));
  const fuel = (dryMass + fuelMass) * (1 - Math.exp(-deltaV / (isp * 9.80665)));
  const options: DisposalOption[] = [
    {
      method: "atmospheric_reentry",
      description: "Lower the perigee into the atmosphere for natural burn-up.",
      status: "preferred",
      delta_v_m_s: deltaV,
      fuel_required_kg: fuel,
      pollution: { value: 18, label: "lower impact" },
      suitability_score: Math.max(40, 96 - altitude / 60),
      explanation: "Lowest-energy option when a controlled re-entry corridor is available.",
    },
    {
      method: "graveyard_orbit",
      description: "Raise the satellite above the protected operational shell.",
      status: "available",
      delta_v_m_s: 235,
      fuel_required_kg: (dryMass + fuelMass) * (1 - Math.exp(-235 / (isp * 9.80665))),
      pollution: { value: 8, label: "lowest impact" },
      suitability_score: 70,
      explanation: "Preserves the spacecraft in a higher orbit but does not remove the object.",
    },
    {
      method: "ocean_fall",
      description: "Target a remote ocean corridor during atmospheric re-entry.",
      status: "conditional",
      delta_v_m_s: deltaV + 22,
      fuel_required_kg: fuel * 1.08,
      pollution: { value: 25, label: "moderate impact" },
      suitability_score: 62,
      explanation: "Requires precise targeting and regulatory coordination.",
    },
  ];
  return {
    simulation: {
      reference_reentry_delta_v_m_s: deltaV,
      reference_reentry_fuel_kg: fuel,
      specific_impulse_s: isp,
      assumptions: ["Circular, coplanar two-body Hohmann transfers.", "Local preview estimate — connect the API for mission analysis."],
    },
    disposal_options: options,
    recommendation: { method: "atmospheric_reentry", reason: "Best balance of energy, removal certainty, and pollution score." },
  };
}

export function Simulate() {
  const [values, setValues] = useState(initialValues);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const totalMass = useMemo(() => Number(values.dry_mass_kg || 0) + Number(values.fuel_mass_kg || 0), [values]);

  async function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      satellite: {
        altitude_km: Number(values.altitude_km),
        dry_mass_kg: Number(values.dry_mass_kg),
        fuel_mass_kg: Number(values.fuel_mass_kg),
      },
      specific_impulse_s: Number(values.specific_impulse_s),
    };
    if (Object.values(payload.satellite).some((value) => !Number.isFinite(value) || value < 0) || payload.satellite.altitude_km < 120 || payload.satellite.dry_mass_kg <= 0) {
      setError("Enter valid values. Altitude must be at least 120 km and dry mass must be greater than zero.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/simulate/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setResult(await response.json() as SimulationResponse);
      } else {
        setResult(localEstimate(values));
      }
    } catch {
      setResult(localEstimate(values));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-50" />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-36">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"><ArrowLeft className="h-4 w-4" /> Back to dashboard</a>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section>
            <span className="label-tech text-brand-neutral">Mission instrument 01</span>
            <h1 className="mt-3 max-w-lg text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">Disposal calculator</h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-text-secondary">Compare disposal strategies for a satellite and understand the delta-v, fuel, and environmental trade-offs before mission planning begins.</p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-success/20 bg-success/[0.06] p-4 text-sm text-text-secondary"><CheckCircle2 className="h-5 w-5 shrink-0 text-success" /><span>Model ready. Results are preliminary planning estimates.</span></div>
          </section>

          <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={calculate} className="glass-panel rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between"><div><span className="label-tech">Satellite profile</span><h2 className="mt-2 text-xl font-semibold text-text-primary">Set mission parameters</h2></div><Rocket className="h-6 w-6 text-brand-secondary" /></div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {([
                ["altitude_km", "Orbital altitude", "km", "120 minimum"],
                ["dry_mass_kg", "Dry mass", "kg", "excluding propellant"],
                ["fuel_mass_kg", "Usable fuel", "kg", "onboard propellant"],
                ["specific_impulse_s", "Specific impulse", "s", "optional engine input"],
              ] as const).map(([key, label, unit, hint]) => (
                <label key={key} className="block"><span className="mb-2 flex items-center justify-between text-sm font-medium text-text-primary"><span>{label}</span><span className="text-xs text-text-secondary">{unit}</span></span><input required min={key === "altitude_km" ? 120 : key === "dry_mass_kg" ? 0.01 : 0} step="any" type="number" value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-text-primary outline-none transition focus:border-brand-secondary" /><span className="mt-1.5 block text-xs text-text-secondary">{hint}</span></label>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5 text-sm"><span className="text-text-secondary">Total launch mass</span><span className="font-semibold text-text-primary">{totalMass.toLocaleString()} kg</span></div>
            {error && <p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
            <button type="submit" disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-semibold text-text-primary transition hover:bg-brand-secondary disabled:cursor-wait disabled:opacity-70">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}{loading ? "Running simulation…" : "Calculate disposal options"}</button>
          </motion.form>
        </div>

        {result && <section className="mt-12" aria-labelledby="results-heading">
          <div className="flex items-end justify-between gap-4"><div><span className="label-tech text-success">Simulation output</span><h2 id="results-heading" className="mt-2 text-2xl font-semibold text-text-primary">Recommended trajectory</h2></div><span className="hidden items-center gap-1.5 text-xs text-text-secondary sm:flex"><Sparkles className="h-3.5 w-3.5 text-brand-neutral" /> Isp {result.simulation.specific_impulse_s}s</span></div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="glass-panel rounded-2xl p-5"><span className="label-tech">Reference delta-v</span><p className="mt-3 text-3xl font-semibold text-text-primary">{formatNumber(result.simulation.reference_reentry_delta_v_m_s, " m/s")}</p><p className="mt-2 text-xs text-text-secondary">Atmospheric re-entry target</p></div>
            <div className="glass-panel rounded-2xl p-5"><span className="label-tech">Fuel required</span><p className="mt-3 text-3xl font-semibold text-text-primary">{formatNumber(result.simulation.reference_reentry_fuel_kg, " kg")}</p><p className="mt-2 text-xs text-text-secondary">Estimated propellant burn</p></div>
            <div className="rounded-2xl border border-success/25 bg-success/[0.08] p-5"><span className="label-tech text-success">Best fit</span><p className="mt-3 text-xl font-semibold text-text-primary">{methodLabels[result.recommendation.method ?? ""] ?? "Review options"}</p><p className="mt-2 text-xs leading-relaxed text-text-secondary">{result.recommendation.reason}</p></div>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-panel/70">
            <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr] gap-4 border-b border-white/[0.07] px-5 py-4 text-xs text-text-secondary sm:grid"><span>Disposal path</span><span>Delta-v</span><span>Fuel</span><span>Suitability</span></div>
            {result.disposal_options.map((option) => <div key={option.method} className="grid gap-3 border-b border-white/[0.06] px-5 py-5 last:border-0 sm:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr] sm:items-center sm:gap-4"><div><div className="flex items-center gap-2"><span className="font-medium text-text-primary">{methodLabels[option.method] ?? option.method}</span>{option.method === result.recommendation.method && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">Recommended</span>}</div><p className="mt-1 text-xs leading-relaxed text-text-secondary">{option.explanation}</p></div><span className="text-sm text-text-primary sm:text-xs">{formatNumber(option.delta_v_m_s, " m/s")}</span><span className="text-sm text-text-primary sm:text-xs">{formatNumber(option.fuel_required_kg, " kg")}</span><span className="text-sm font-semibold text-success sm:text-xs">{option.suitability_score.toFixed(0)} / 100</span></div>)}
          </div>
          <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-text-secondary"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-neutral" /> {result.simulation.assumptions.join(" ")}</p>
        </section>}
      </main>
    </div>
  );
}
