from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect
from app.repositories.danger_repository import DangerRepository
from app.schemas.danger import AlertResponse, AlertStatus, DashboardResponse, MapObject, MarkReadResponse, ObjectType, RiskLevel, UnreadCount
from app.services.orbit_service import OrbitPropagationError, OrbitService
from app.websocket.manager import manager

router=APIRouter(prefix="/api/danger",tags=["danger notifier"])
repository=DangerRepository()

# Singleton OrbitService partagé par /map et réutilisé entre les requêtes.
# Evite de reconstruire le cache EarthSatellite (1500 initialisations SGP4) à chaque appel.
_orbit_service: OrbitService | None = None

def _get_orbit_service() -> OrbitService:
    global _orbit_service
    if _orbit_service is None:
        _orbit_service = OrbitService()
    return _orbit_service

@router.get("/alerts",response_model=list[AlertResponse])
def alerts(risk_level: RiskLevel|None=None,is_read: bool|None=None,status: AlertStatus|None=None,limit:int=Query(100,ge=1,le=500),offset:int=Query(0,ge=0)):
    return repository.list_alerts(risk_level, is_read, status, limit, offset)

@router.get("/alerts/unread-count",response_model=UnreadCount)
def unread_count(): return UnreadCount(unread=repository.count(" WHERE is_read=0"))

@router.patch("/alerts/read-all",response_model=MarkReadResponse)
def read_all(): return MarkReadResponse(updated=repository.mark_read())

@router.get("/alerts/{alert_id}",response_model=AlertResponse)
def alert(alert_id:str):
    result=repository.get_alert(alert_id)
    if not result: raise HTTPException(404,"Alert not found")
    return result

@router.patch("/alerts/{alert_id}/read",response_model=MarkReadResponse)
def read(alert_id:str):
    if not repository.get_alert(alert_id): raise HTTPException(404,"Alert not found")
    return MarkReadResponse(updated=repository.mark_read(alert_id))

@router.get("/dashboard",response_model=DashboardResponse)
def dashboard():
    count=lambda where="",params=(): repository.count(where,params)
    return DashboardResponse(total_alerts=count(),unread_alerts=count(" WHERE is_read=0"),high_risk=count(" WHERE risk_level='HIGH'"),medium_risk=count(" WHERE risk_level='MEDIUM'"),low_risk=count(" WHERE risk_level='LOW'"),active_threats=count(" WHERE status='ACTIVE'"),monitored_satellites=repository.count_objects(ObjectType.ACTIVE_SATELLITE),monitored_objects=repository.count_objects())

@router.get("/threats",response_model=list[AlertResponse])
def threats(): return repository.list_alerts(status=AlertStatus.ACTIVE)

@router.get("/map",response_model=list[MapObject])
def map_data():
    from app.core.config import danger_settings as _ds
    risks=repository.active_risks()
    try:
        orbit=_get_orbit_service()   # FIX: singleton — cache EarthSatellite préservé entre les requêtes
        now=datetime.now(timezone.utc); data=[]
    except OrbitPropagationError as exc: raise HTTPException(503,"Orbital propagation service unavailable") from exc
    for obj in repository.map_objects(_ds.map_max_objects):
        try: lat,lon,alt=orbit.map_position(obj,now); data.append(MapObject(id=obj.id,name=obj.name,norad_id=obj.norad_id,object_type=obj.object_type,latitude=lat,longitude=lon,altitude_km=alt,risk_level=risks.get(obj.id)))
        except OrbitPropagationError: continue
    return data

@router.websocket("/ws")
async def websocket(socket:WebSocket):
    await manager.connect(socket)
    try:
        while True: await socket.receive_text()
    except WebSocketDisconnect: manager.disconnect(socket)
