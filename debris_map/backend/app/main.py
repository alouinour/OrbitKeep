from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.debris import router as debris_router

app = FastAPI(title="OrbitKeep Debris Map API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(debris_router)

@app.get("/health")
def health():
    return {"status": "ok"}