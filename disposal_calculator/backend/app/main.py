import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes.simulation import router
from app.core.config import settings
from app.utils.logging import configure_logging

configure_logging()
app = FastAPI(title="OrbitKeep Disposal Calculator API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=list(settings.cors_origins), allow_credentials=True, allow_methods=["POST"], allow_headers=["*"])
app.include_router(router)


@app.exception_handler(ValueError)
async def physics_error(_: Request, exc: ValueError) -> JSONResponse:
    logging.getLogger(__name__).warning("Physics/business validation error: %s", exc)
    return JSONResponse(status_code=400, content={"error": {"code": "INVALID_CALCULATION", "message": str(exc), "details": {}}})


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
