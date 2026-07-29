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
SB_COMPETITION_ID = 2  # Premier League
SB_SEASON_ID = 44  # 2003/2004

# Understat cache produced by scripts/fetch_understat.mjs
UNDERSTAT_FILE = RAW / "understat_arsenal_2025.json"

# Prior-season player minutes, for the squad-stability minutes-weighted departure
# figure. 2024/25 from Understat (same source family as 2025/26); 2002/03 from
# FBref's Standard Stats read via an Internet Archive Wayback snapshot (live FBref
# is Cloudflare-gated). Both cached under data/raw for reproducibility.
UNDERSTAT_2024_25_FILE = RAW / "understat_arsenal_2024.json"
FBREF_2002_03_FILE = RAW / "fbref_arsenal_2002_03.json"
# Understat EPL 2025/26 league page (all 20 clubs' per-match history), for the
# Section D synthesis peer scatter (field resistance + expected points per club).
UNDERSTAT_EPL_2025_FILE = RAW / "understat_epl_2025.json"

TEAM = "Arsenal"
ROLLING_N = 6  # rolling-form window (matches)
PER90_BASE = 90.0
POINTS = {"W": 3, "D": 1, "L": 0}
