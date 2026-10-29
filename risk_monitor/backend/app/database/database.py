import sqlite3
from contextlib import contextmanager
from pathlib import Path
from app.core.config import danger_settings

def _path():
    if not danger_settings.database_url.startswith("sqlite:///"): raise ValueError("DATABASE_URL must use sqlite:///")
    return danger_settings.database_url.removeprefix("sqlite:///") or "orbitkeep.db"
@contextmanager
def connection():
    path=_path()
    if path != ":memory:": Path(path).parent.mkdir(parents=True,exist_ok=True)
    conn=sqlite3.connect(path,check_same_thread=False); conn.row_factory=sqlite3.Row
    try: yield conn; conn.commit()
    except Exception: conn.rollback(); raise
    finally: conn.close()
def create_tables():
    with connection() as conn: conn.executescript("""CREATE TABLE IF NOT EXISTS orbital_objects (id TEXT PRIMARY KEY,norad_id INTEGER NOT NULL UNIQUE,name TEXT NOT NULL,object_type TEXT NOT NULL,tle_line1 TEXT NOT NULL,tle_line2 TEXT NOT NULL,is_active INTEGER NOT NULL,updated_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY,satellite_id TEXT NOT NULL,satellite_name TEXT NOT NULL,satellite_norad_id INTEGER NOT NULL,debris_id TEXT NOT NULL,debris_name TEXT NOT NULL,debris_norad_id INTEGER NOT NULL,distance_km REAL NOT NULL,closest_approach_time TEXT NOT NULL,risk_level TEXT NOT NULL,detected_at TEXT NOT NULL,is_read INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL); CREATE INDEX IF NOT EXISTS idx_alert_filters ON alerts(risk_level,is_read,status);""")
