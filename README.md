# OrbitKeep — Main Dashboard

A React + Vite + TypeScript + Tailwind CSS foundation for the OrbitKeep
platform: the landing/dashboard shell that SIMULATE, AWARENESS, and
COLLISION RISK will plug into.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build (also type-checks)
npm run preview  # serve the production build
```

## 1. Component structure

```
src/
  components/
    Navbar.tsx              floating glass nav, active-link + mobile menu
    OrbitMark.tsx            reusable orbital icon (logo mark)
    Hero.tsx                 headline, CTAs, status badge
    EarthVisualization.tsx   CSS/SVG Earth placeholder (swap for 3D later)
    OrbitalStats.tsx         4-stat strip with count-up animation
    ToolCard.tsx             single reusable card for the 3 tools
    ToolsSection.tsx         grid wrapper around 3x ToolCard
    OrbitalStatus.tsx        "Live Orbital Status" panel + radar graphic
    RiskEvents.tsx           "Recent Risk Events" list
    Footer.tsx
  hooks/
    useCountUp.ts            IntersectionObserver-driven number animation
  data/
    mockData.ts              all mock content: stats, tool copy, nav, etc.
  pages/
    Dashboard.tsx            composes every section into the landing page
  App.tsx                    currently just renders <Dashboard />
  index.css                  Tailwind v4 theme tokens + base/component layers
```

Every section is data-driven from `src/data/mockData.ts` — no copy is
hardcoded inside JSX beyond static labels — so content can be swapped for a
live feed without touching component markup.

## 2. Design system

Defined as CSS custom properties in `src/index.css` via Tailwind v4's
`@theme` block, which automatically generates matching utility classes
(`bg-brand-primary`, `text-text-secondary`, `bg-danger`, etc.):

| Token | Hex | Usage |
|---|---|---|
| `--color-brand-primary` | `#262369` | Primary interactive (buttons, CTAs) |
| `--color-brand-secondary` | `#4b49a3` | Secondary accents, active nav state |
| `--color-brand-neutral` | `#bcc4c7` | Borders, icons, neutral UI |
| `--color-bg` | `#070912` | Page background |
| `--color-bg-secondary` / `--color-panel` | `#0b0f1a` / `#0d1120` | Panels, cards |
| `--color-text-primary` | `#f3f5f7` | Primary text |
| `--color-text-secondary` | `#8b95a1` | Secondary text, labels |
| `--color-success` | `#3fa66b` | Healthy/active states only |
| `--color-warning` | `#f2a900` | Medium-risk / warning states only |
| `--color-danger` | `#d94a4a` | High-risk / critical states only |

**Type:** Inter (self-hosted via `@fontsource/inter`, weights 400–700), no
external font requests. Technical labels use `.label-tech`: uppercase,
0.14em tracking, 11px, secondary color.

**Surfaces:** `.glass-panel` = translucent panel + blur + hairline border,
used for the navbar, stats strip, and status/events panels. Cards use
`border-white/[0.07]` rather than glass, so glass stays a deliberate accent
rather than the default for every surface.

**Radius:** cards/panels use `rounded-2xl` (16px); nav pill and inputs use
`rounded-xl`/`rounded-lg`.

**Motion:** Framer Motion for on-scroll reveals (`whileInView`, once-only),
hover lift on cards, a slow-rotating orbital ring and pulsing debris points
in the hero, and a rotating radar sweep in the status panel. Reduced-motion
is respected globally via a CSS media query in `index.css`.

## 3. Adding SIMULATE, AWARENESS, and COLLISION RISK

The dashboard currently has no router — `App.tsx` renders `<Dashboard />`
directly. To add the three tools as real pages:

1. **Install a router** (e.g. `react-router-dom`).
2. **Create page files** alongside `Dashboard.tsx`:
   `src/pages/Simulate.tsx`, `src/pages/DebrisMap.tsx`,
   `src/pages/RiskMonitor.tsx`.
3. **Wire routes in `App.tsx`**, mapping them to the same paths already used
   throughout the app (`/simulate`, `/debris-map`, `/risk-monitor` — see
   `href`s in `mockData.ts`, `Hero.tsx`, and `ToolCard.tsx`).
4. **Reuse `Navbar` and `Footer`** on every new page for a consistent shell;
   pass the current path into `Navbar` (or read it from the router) so the
   correct link gets the active state instead of hardcoding `active: true`
   on "Dashboard" in `mockData.ts`.
5. **Reuse the token system**: import nothing extra — every new page
   automatically has access to `bg-brand-primary`, `.glass-panel`,
   `.label-tech`, etc. via the global `index.css`.
6. **Replace mock data per page** the same way the dashboard does: add a
   typed data module (e.g. `data/simulateData.ts`) rather than inlining
   numbers in JSX, so it's easy to swap in the CelesTrak/Space-Track API
   later.
7. **Swap `EarthVisualization`** for a real WebGL/3D globe (e.g. react-globe.gl
   or a custom Three.js scene) when ready — it's already isolated as its own
   component with no external dependencies on hero layout.

No backend, auth, or real orbital math is implemented yet, per spec — this
version establishes the shell and design system only.
