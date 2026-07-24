"""Shared paths and constants for the analysis package."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"

# Season labels (used as the primary key across every processed file).
S0304 = "2003/04"
S2526 = "2025/26"

# StatsBomb open-data identifiers for the Invincibles season.
SB_COMPETITION_ID = 2   # Premier League
SB_SEASON_ID = 44       # 2003/2004

# Understat cache produced by scripts/fetch_understat.mjs
UNDERSTAT_FILE = RAW / "understat_arsenal_2025.json"

TEAM = "Arsenal"
ROLLING_N = 6           # rolling-form window (matches)
PER90_BASE = 90.0
POINTS = {"W": 3, "D": 1, "L": 0}
