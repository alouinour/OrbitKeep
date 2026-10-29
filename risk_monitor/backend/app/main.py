from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.danger import router
from app.core.config import danger_settings  # NOUVEAU
from app.database.database import create_tables
from app.services.monitor_service import MonitorService

monitor = MonitorService()


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    monitor.start()
    yield
    await monitor.stop()


app = FastAPI(title="OrbitKeep Danger Notifier API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    # FIX: origines lues depuis CORS_ORIGINS (.env) au lieu d'être codées en dur
    allow_origins=[o.strip() for o in danger_settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}