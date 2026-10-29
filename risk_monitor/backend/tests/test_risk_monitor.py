"""
Unit tests for the OrbitKeep risk monitor backend.
Run with:  .venv/Scripts/pytest tests/ -v
"""
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import numpy as np
import pytest

# Make sure the app package is importable from the backend root
sys.path.insert(0, str(Path(__file__).parent.parent))


# ---------------------------------------------------------------------------
# classify_risk
# ---------------------------------------------------------------------------
from app.services.risk_service import classify_risk
from app.schemas.danger import RiskLevel


class TestClassifyRisk:
    def test_high_below_threshold(self):
        assert classify_risk(0.0) is RiskLevel.HIGH

    def test_high_just_below_1km(self):
        assert classify_risk(0.999) is RiskLevel.HIGH

    def test_medium_at_exactly_1km(self):
        # boundary: < 1.0 is HIGH, >= 1.0 is MEDIUM (strict <)
        assert classify_risk(1.0) is RiskLevel.MEDIUM

    def test_medium_between_thresholds(self):
        assert classify_risk(2.5) is RiskLevel.MEDIUM

    def test_medium_just_below_5km(self):
        assert classify_risk(4.999) is RiskLevel.MEDIUM

    def test_low_at_exactly_5km(self):
        # boundary: < 5.0 is MEDIUM, >= 5.0 is LOW (strict <)
        assert classify_risk(5.0) is RiskLevel.LOW

    def test_low_above_threshold(self):
        assert classify_risk(100.0) is RiskLevel.LOW

    def test_negative_distance_raises(self):
        with pytest.raises(ValueError):
            classify_risk(-1.0)


# ---------------------------------------------------------------------------
# closest_from_positions
# ---------------------------------------------------------------------------
from app.services.collision_service import closest_from_positions, sample_times


class TestClosestFromPositions:
    def _times(self, n: int = 5):
        start = datetime(2026, 1, 1, tzinfo=timezone.utc)
        return [start + timedelta(seconds=i * 30) for i in range(n)]

    def test_returns_minimum_distance(self):
        times = self._times(5)
        # Two objects: one stationary at origin, one moving away then back
        a = np.zeros((5, 3))
        b = np.array([[10, 0, 0], [5, 0, 0], [1, 0, 0], [5, 0, 0], [10, 0, 0]], dtype=float)
        dist, t = closest_from_positions(a, b, times)
        assert pytest.approx(dist, abs=1e-6) == 1.0
        assert t == times[2]

    def test_single_timestep(self):
        times = self._times(1)
        a = np.array([[0, 0, 0]], dtype=float)
        b = np.array([[3, 4, 0]], dtype=float)
        dist, t = closest_from_positions(a, b, times)
        assert pytest.approx(dist, abs=1e-6) == 5.0
        assert t == times[0]

    def test_identical_positions_gives_zero(self):
        times = self._times(3)
        pos = np.ones((3, 3))
        dist, _ = closest_from_positions(pos, pos, times)
        assert dist == pytest.approx(0.0)

    def test_sample_times_count(self):
        start = datetime(2026, 1, 1, tzinfo=timezone.utc)
        times = sample_times(start, window_minutes=60, sample_seconds=30)
        # 0, 30, 60, ..., 3600  → 121 points
        assert len(times) == 121
        assert times[0] == start
        assert times[-1] == start + timedelta(hours=1)


# ---------------------------------------------------------------------------
# _omm_to_tle — checksum + structure
# ---------------------------------------------------------------------------
from app.services.celestrak_service import CelestrakService


class TestOmmToTle:
    # Enregistrement OMM réaliste (ISS-like, valeurs simplifiées)
    _rec = {
        "OBJECT_NAME": "TEST SAT",
        "OBJECT_ID": "2020-001A",
        "NORAD_CAT_ID": 25544,
        "EPOCH": "2026-01-15T12:00:00.000000",
        "MEAN_MOTION": 15.49004828,
        "ECCENTRICITY": 0.0002717,
        "INCLINATION": 51.6432,
        "RA_OF_ASC_NODE": 247.4627,
        "ARG_OF_PERICENTER": 130.5360,
        "MEAN_ANOMALY": 325.0288,
        "BSTAR": 0.000028098,
        "MEAN_MOTION_DOT": 0.00002182,
        "MEAN_MOTION_DDOT": 0.0,
        "EPHEMERIS_TYPE": 0,
        "CLASSIFICATION_TYPE": "U",
        "ELEMENT_SET_NO": 999,
        "REV_AT_EPOCH": 44009,
    }

    def test_returns_two_non_empty_strings(self):
        l1, l2 = CelestrakService._omm_to_tle(self._rec, 25544)
        assert isinstance(l1, str) and len(l1) > 0
        assert isinstance(l2, str) and len(l2) > 0

    def test_line1_starts_with_1(self):
        l1, _ = CelestrakService._omm_to_tle(self._rec, 25544)
        assert l1.startswith("1 ")

    def test_line2_starts_with_2(self):
        _, l2 = CelestrakService._omm_to_tle(self._rec, 25544)
        assert l2.startswith("2 ")

    def test_checksum_line1(self):
        l1, _ = CelestrakService._omm_to_tle(self._rec, 25544)
        body, check = l1[:-1], int(l1[-1])
        expected = sum(int(c) if c.isdigit() else (1 if c == "-" else 0) for c in body) % 10
        assert check == expected

    def test_checksum_line2(self):
        _, l2 = CelestrakService._omm_to_tle(self._rec, 25544)
        body, check = l2[:-1], int(l2[-1])
        expected = sum(int(c) if c.isdigit() else (1 if c == "-" else 0) for c in body) % 10
        assert check == expected

    def test_missing_required_field_returns_empty(self):
        bad = {k: v for k, v in self._rec.items() if k != "MEAN_MOTION"}
        l1, l2 = CelestrakService._omm_to_tle(bad, 25544)
        assert l1 == "" and l2 == ""

    def test_norad_id_above_99999_truncated(self):
        l1, l2 = CelestrakService._omm_to_tle(self._rec, 100001)
        # norad_id % 100000 = 1  →  "00001"
        assert "00001" in l1
        assert "00001" in l2


# ---------------------------------------------------------------------------
# DangerRepository — upsert_alert deduplication (in-memory SQLite)
# ---------------------------------------------------------------------------
import os
from app.database.database import create_tables
from app.repositories.danger_repository import DangerRepository
from app.schemas.danger import OrbitalObject, ObjectType, AlertStatus


@pytest.fixture()
def repo(tmp_path, monkeypatch):
    """Repository backed by a fresh in-memory database for each test."""
    db_file = str(tmp_path / "test.db")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_file}")
    # Re-import config so it picks up the monkeypatched env var
    import importlib, app.core.config as cfg_mod, app.database.database as db_mod, app.repositories.danger_repository as repo_mod
    importlib.reload(cfg_mod)
    importlib.reload(db_mod)
    importlib.reload(repo_mod)
    db_mod.create_tables()
    r = repo_mod.DangerRepository()
    # Seed two objects
    sat = OrbitalObject(id="sat-1", name="SAT-A", norad_id=10001, object_type=ObjectType.ACTIVE_SATELLITE,
                        tle_line1="1 10001U", tle_line2="2 10001", is_active=True)
    deb = OrbitalObject(id="deb-1", name="DEB-B", norad_id=20001, object_type=ObjectType.DEBRIS,
                        tle_line1="1 20001U", tle_line2="2 20001", is_active=False)
    r.upsert_objects([sat, deb])
    return r, sat, deb


class TestUpsertAlertDeduplication:
    _approach = datetime(2026, 6, 1, 12, 0, 0, tzinfo=timezone.utc)

    def test_first_insert_creates_alert(self, repo):
        r, sat, deb = repo
        alert, is_new = r.upsert_alert(sat, deb, 2.5, self._approach, RiskLevel.MEDIUM, 300)
        assert is_new is True
        assert alert.satellite_id == "sat-1"
        assert alert.status == AlertStatus.ACTIVE.value

    def test_duplicate_within_tolerance_updates_not_inserts(self, repo):
        r, sat, deb = repo
        r.upsert_alert(sat, deb, 2.5, self._approach, RiskLevel.MEDIUM, 300)
        # Same pair, approach time 200s later (within 300s tolerance)
        approach2 = self._approach + timedelta(seconds=200)
        alert2, is_new = r.upsert_alert(sat, deb, 2.3, approach2, RiskLevel.MEDIUM, 300)
        assert is_new is False
        assert r.count() == 1  # still only one row

    def test_outside_tolerance_creates_new_alert(self, repo):
        r, sat, deb = repo
        r.upsert_alert(sat, deb, 2.5, self._approach, RiskLevel.MEDIUM, 300)
        approach2 = self._approach + timedelta(seconds=400)
        _, is_new = r.upsert_alert(sat, deb, 2.3, approach2, RiskLevel.MEDIUM, 300)
        assert is_new is True
        assert r.count() == 2
