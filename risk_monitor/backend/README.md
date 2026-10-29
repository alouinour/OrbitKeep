# OrbitKeep Danger Notifier API

From this folder, install dependencies with `python -m pip install -r requirements.txt`, then start the API with:

```powershell
uvicorn app.main:app --reload
```

Copy `.env.example` to `.env`. Set `MONITOR_ENABLED=true` to periodically retrieve CelesTrak TLE data and screen active satellite/debris conjunctions. The interactive API documentation is at `/docs`.

The notifier uses Skyfield to propagate TLEs to geocentric ECI/ICRF positions, samples a configurable future window to find approximate closest approaches, stores MEDIUM/HIGH alerts in SQLite, and broadcasts newly detected alerts at `WS /api/danger/ws`.

This is an approximate research screening tool—not a collision-avoidance system. TLE uncertainty, sampling, covariance, relative velocity, manoeuvres, and collision probability are not fully modelled.
