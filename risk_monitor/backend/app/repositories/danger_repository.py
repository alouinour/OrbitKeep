from datetime import datetime,timedelta,timezone
from uuid import uuid4
from app.database.database import connection
from app.schemas.danger import AlertResponse,AlertStatus,OrbitalObject,RiskLevel
def _now(): return datetime.now(timezone.utc)
def _iso(v): return v.astimezone(timezone.utc).isoformat()
class DangerRepository:
 def upsert_objects(self,objects):
  with connection() as c: c.executemany("INSERT INTO orbital_objects VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(norad_id) DO UPDATE SET name=excluded.name,object_type=excluded.object_type,tle_line1=excluded.tle_line1,tle_line2=excluded.tle_line2,is_active=excluded.is_active,updated_at=excluded.updated_at",[(o.id,o.norad_id,o.name,o.object_type.value,o.tle_line1,o.tle_line2,int(o.is_active),_iso(_now())) for o in objects])
 def _object(self,r): return OrbitalObject(id=r['id'],name=r['name'],norad_id=r['norad_id'],object_type=r['object_type'],tle_line1=r['tle_line1'],tle_line2=r['tle_line2'],is_active=bool(r['is_active']))
 def objects(self,object_type=None):
  q="SELECT * FROM orbital_objects"+(" WHERE object_type=?" if object_type else "")
  with connection() as c: rows=c.execute(q,(object_type,) if object_type else ()).fetchall()
  return [self._object(r) for r in rows]
 # NOUVEAU: compter en SQL (avant: len(objects()) chargeait + parsait TOUS les TLE à chaque appel du dashboard)
 def count_objects(self,object_type=None):
  with connection() as c:return c.execute("SELECT COUNT(*) FROM orbital_objects"+(" WHERE object_type=?" if object_type else ""),(object_type,) if object_type else ()).fetchone()[0]
 # NOUVEAU: objets impliqués dans une alerte ACTIVE d'abord, puis les autres jusqu'à `limit`
 def map_objects(self,limit):
  q="SELECT * FROM orbital_objects ORDER BY CASE WHEN id IN (SELECT satellite_id FROM alerts WHERE status='ACTIVE' UNION SELECT debris_id FROM alerts WHERE status='ACTIVE') THEN 0 ELSE 1 END, norad_id LIMIT ?"
  with connection() as c: rows=c.execute(q,(limit,)).fetchall()
  return [self._object(r) for r in rows]
 # NOUVEAU: risque le PLUS ÉLEVÉ par objet (avant: le dernier alert lu écrasait les autres, HIGH pouvait devenir MEDIUM)
 def active_risks(self):
  rank={'LOW':1,'MEDIUM':2,'HIGH':3}; best={}
  with connection() as c: rows=c.execute("SELECT satellite_id,debris_id,risk_level FROM alerts WHERE status='ACTIVE'").fetchall()
  for r in rows:
   for oid in (r['satellite_id'],r['debris_id']):
    if rank[r['risk_level']]>rank.get(best.get(oid),0): best[oid]=r['risk_level']
  return {oid:RiskLevel(level) for oid,level in best.items()}
 # NOUVEAU: aucune alerte ne passait jamais à RESOLVED → une approche passée restait "ACTIVE" pour toujours
 def resolve_expired(self,now=None):
  with connection() as c:return c.execute("UPDATE alerts SET status='RESOLVED' WHERE status='ACTIVE' AND closest_approach_time<?",(_iso(now or _now()),)).rowcount
 def _alert(self,r): return AlertResponse(id=r['id'],satellite_id=r['satellite_id'],satellite_name=r['satellite_name'],debris_id=r['debris_id'],debris_name=r['debris_name'],distance_km=r['distance_km'],closest_approach_time=r['closest_approach_time'],risk_level=r['risk_level'],detected_at=r['detected_at'],is_read=bool(r['is_read']),status=r['status'])
 def list_alerts(self,risk_level=None,is_read=None,status=None,limit=100,offset=0):
  cs=[]; p=[]
  for f,v in (("risk_level",risk_level),("is_read",None if is_read is None else int(is_read)),("status",status)):
   if v is not None: cs.append(f+"=?");p.append(v)
  with connection() as c: rows=c.execute("SELECT * FROM alerts"+(" WHERE "+" AND ".join(cs) if cs else "")+" ORDER BY CASE risk_level WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 ELSE 2 END, closest_approach_time LIMIT ? OFFSET ?",[*p,limit,offset]).fetchall()
  return [self._alert(r) for r in rows]
 def get_alert(self,id):
  with connection() as c:r=c.execute("SELECT * FROM alerts WHERE id=?",(id,)).fetchone()
  return self._alert(r) if r else None
 def mark_read(self,id=None):
  with connection() as c:return c.execute("UPDATE alerts SET is_read=1"+(" WHERE id=?" if id else " WHERE is_read=0"),(id,) if id else ()).rowcount
 def count(self,where="",params=()):
  with connection() as c:return c.execute("SELECT COUNT(*) FROM alerts"+where,params).fetchone()[0]
 def upsert_alert(self,satellite,debris,distance_km,approach,risk,tolerance_seconds):
  lo,hi=_iso(approach-timedelta(seconds=tolerance_seconds)),_iso(approach+timedelta(seconds=tolerance_seconds))
  with connection() as c:
   old=c.execute("SELECT id FROM alerts WHERE satellite_norad_id=? AND debris_norad_id=? AND closest_approach_time BETWEEN ? AND ?",(satellite.norad_id,debris.norad_id,lo,hi)).fetchone()
   if old:
    c.execute("UPDATE alerts SET distance_km=?,closest_approach_time=?,risk_level=?,status='ACTIVE' WHERE id=?",(distance_km,_iso(approach),risk.value,old['id']));return self._alert(c.execute("SELECT * FROM alerts WHERE id=?",(old['id'],)).fetchone()),False
   id=str(uuid4());c.execute("INSERT INTO alerts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",(id,satellite.id,satellite.name,satellite.norad_id,debris.id,debris.name,debris.norad_id,distance_km,_iso(approach),risk.value,_iso(_now()),0,AlertStatus.ACTIVE.value));return self._alert(c.execute("SELECT * FROM alerts WHERE id=?",(id,)).fetchone()),True