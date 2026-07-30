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
# Understat EPL 2025/26 league page (all 20 clubs' per-match history). Provides
# every club's week-by-week points for the cumulative title-race pressure metric.
UNDERSTAT_EPL_2025_FILE = RAW / "understat_epl_2025.json"
# football-data.co.uk full 2003/04 league results (all 380 matches, dates +
# scores): the only source with every 2003/04 club's results, needed to rebuild
# the week-by-week table for the cumulative pressure metric. Validated in-pipeline
# against the known final table (Arsenal 90 unbeaten, Chelsea 79, and so on).
FOOTBALLDATA_2003_04_FILE = RAW / "footballdata_epl_2003_04.csv"

TEAM = "Arsenal"
ROLLING_N = 6  # rolling-form window (matches)
PER90_BASE = 90.0
POINTS = {"W": 3, "D": 1, "L": 0}
