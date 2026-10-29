# OrbitKeep Disposal Calculator API

Standalone FastAPI backend for comparing preliminary satellite disposal options. It is deliberately separate from the existing React frontend.

## Run

Requires Python 3.12+. From `backend/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` (or `/redoc`). Run tests with `pytest`.

## API

`POST /simulate/calculate`

```json
{
  "satellite": {"altitude_km": 700, "fuel_mass_kg": 42, "dry_mass_kg": 500},
  "specific_impulse_s": 220
}
```

`dry_mass_kg` is explicit because the Tsiolkovsky equation requires both current/initial mass and final mass. `specific_impulse_s` is optional; the default is a configurable project assumption, not universal spacecraft data.

```powershell
curl.exe -X POST http://127.0.0.1:8000/simulate/calculate -H "Content-Type: application/json" -d '{\"satellite\":{\"altitude_km\":700,\"fuel_mass_kg\":42,\"dry_mass_kg\":500},\"specific_impulse_s\":220}'
```

## Assumptions and configuration

The service uses ideal circular, coplanar two-body Hohmann transfers. It excludes drag, inclination, finite burns, attitude constraints, breakup, targeting, and mission/regulatory analysis. Atmospheric interface (120 km), graveyard target (2,000 km), lunar proxy delta-v, default Isp, CORS origins, and pollution scores are environment-configurable via `ATMOSPHERIC_INTERFACE_ALTITUDE_KM` (code constant), `GRAVEYARD_ALTITUDE_KM`, `MOON_IMPACT_DELTA_V_M_S`, `DEFAULT_SPECIFIC_IMPULSE_S`, `CORS_ORIGINS`, and `POLLUTION_*`.

Pollution scores are intentionally labelled **project assumptions** and must be replaced with validated research before real-world use. The Moon option is especially a planning placeholder and needs a mission-specific trajectory analysis.
