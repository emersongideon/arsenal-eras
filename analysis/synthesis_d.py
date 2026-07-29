"""Section D - "The synthesis". Combines the two forces from the framework.

Two elements, built honestly given the data actually available:

1. PEER SCATTER (all 20 clubs, 2025/26). One consistent axis per dot:
   - x = FIELD RESISTANCE (the outside force only): position-race pressure each
     club faced, `sum over other clubs of exp(-|points_gap| / tau)` with tau=10,
     the same decay as Section B. Measured identically for every club from the
     final table, so every dot's x means the same thing. (For the champion this
     equals Section B's title-race pressure index.)
   - y = OVER-PERFORMANCE: actual league points minus model-expected points, from
     the SAME Poisson expected-points model used for Arsenal, fit per club on that
     club's 38 matches (per-match xG from Understat's league page).
   The inside force (squad stability, fixture load) is NOT on this axis, because it
   cannot be measured to the Section B/C standard for rival clubs. Stated openly.

2. ARSENAL COMBINED (full two-force method, the one club with complete data for
   both eras). difficulty = equal-weighted average of the normalised outside and
   inside components, normalised across Arsenal's two complete-data seasons:
     - outside  = title-race pressure index (Section B)
     - inside 1 = minutes-weighted departure share (Section B part 2)
     - inside 2 = short-rest share of games (Section C)
   Equal weighting is a stated default CHOICE, not a fact; the method holds for any
   weights. No peer's inside-force values are estimated anywhere.
"""

from __future__ import annotations

import json

import numpy as np
import pandas as pd

from . import config as C
from . import facts, model
from .config import S0304, S2526

TAU = 10.0

# Understat league titles -> the names used in facts.FINAL_TABLE.
_UNDERSTAT_NAME = {
    "Brighton": "Brighton & Hove Albion",
    "Tottenham": "Tottenham Hotspur",
    "West Ham": "West Ham United",
    "Newcastle United": "Newcastle United",
    "Leeds": "Leeds United",
    "Wolverhampton Wanderers": "Wolverhampton Wanderers",
}


def _field_resistance(points: list[int]) -> list[float]:
    """Position-race pressure for each club: sum of exp(-|gap|/tau) over the others."""
    pts = np.asarray(points, dtype=float)
    out = []
    for i, p in enumerate(pts):
        others = np.delete(pts, i)
        out.append(float(np.exp(-np.abs(others - p) / TAU).sum()))
    return out


def _club_frame(history: list[dict]) -> pd.DataFrame:
    """Build a per-match frame (model's expected columns) from Understat history."""
    rows = []
    for i, m in enumerate(history, start=1):
        rows.append({
            "season": S2526,
            "match_no": i,
            "date": m["date"][:10],
            "opponent": "",
            "venue": "H" if m["h_a"] == "h" else "A",
            "gf": int(m["scored"]),
            "ga": int(m["missed"]),
            "result": str(m["result"])[0].upper(),
            "points": int(m["pts"]),
            "xgf": round(float(m["xG"]), 4),
            "xga": round(float(m["xGA"]), 4),
        })
    return pd.DataFrame(rows)


def _peer_scatter() -> list[dict]:
    teams = json.loads(C.UNDERSTAT_EPL_2025_FILE.read_text())["teams"]
    final = facts.FINAL_TABLE[S2526]
    names = [t for t, _ in final]
    fr = dict(zip(names, _field_resistance([p for _, p in final]), strict=False))
    table_pts = dict(final)

    out = []
    for t in teams.values():
        name = _UNDERSTAT_NAME.get(t["title"], t["title"])
        if name not in fr:
            raise ValueError(f"Understat club {t['title']!r} not matched to the final table")
        res = model.season_model_result(_club_frame(t["history"]))
        if res["actual_points"] != table_pts[name]:
            raise ValueError(
                f"{name}: Understat points {res['actual_points']} != table {table_pts[name]}"
            )
        out.append({
            "club": name,
            "field_resistance": round(fr[name], 2),
            "actual_points": res["actual_points"],
            "expected_points": res["expected_points"],
            "over_performance": res["points_over_expected"],
            "is_arsenal": name == "Arsenal",
        })
    out.sort(key=lambda r: -r["field_resistance"])
    return out


def _arsenal_combined(circ: dict, phys: dict) -> dict:
    """Full two-force difficulty for Arsenal's two complete-data seasons, each
    component min-max normalised across the two eras, then equal-weighted."""
    field = circ["field_strength"]["by_season"]
    stab = circ["squad_stability"]["by_season"]
    fx = phys["fixture_congestion"]["by_season"]

    raw = {}
    for s in (S0304, S2526):
        raw[s] = {
            "field": field[s]["pressure_index"],
            "departures": stab[s]["departed_minutes_pct"],
            "short_rest": round(100 * fx[s]["short_rest_count"] / fx[s]["total_games"], 1),
        }

    comps = ["field", "departures", "short_rest"]
    lo = {k: min(raw[s][k] for s in (S0304, S2526)) for k in comps}
    hi = {k: max(raw[s][k] for s in (S0304, S2526)) for k in comps}

    by_era = {}
    for s in (S0304, S2526):
        norm = {
            k: (round((raw[s][k] - lo[k]) / (hi[k] - lo[k]), 3) if hi[k] > lo[k] else 0.0)
            for k in comps
        }
        by_era[s] = {
            "raw": raw[s],
            "norm": norm,
            "difficulty": round(sum(norm.values()) / len(comps), 3),
        }
    return {
        "components": comps,
        "weights": "equal",
        "normalisation": "min-max across Arsenal's two complete-data seasons",
        "by_era": by_era,
    }


def build(circ: dict, phys: dict) -> dict:
    return {
        "metric": "synthesis_d",
        "season": S2526,
        "tau": TAU,
        "peer": {
            "note": (
                "x = field resistance (outside force only), measured identically for "
                "every club; y = actual minus model-expected points. The inside force is "
                "not on this axis because it cannot be measured to the same standard for "
                "rival clubs."
            ),
            "clubs": _peer_scatter(),
        },
        "arsenal_combined": _arsenal_combined(circ, phys),
    }
