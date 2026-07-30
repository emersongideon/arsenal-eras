"""Section D - "The synthesis". Combines the two forces into one difficulty score
for each era.

difficulty = weighted average of three components, each min-max normalised across
Arsenal's two complete-data seasons:
    - outside  = title-race pressure index (Section B, week-by-week)
    - inside 1 = minutes-weighted departure share (Section B / C squad stability)
    - inside 2 = short-rest share of games (Section C fixture load)

The weights are the reader's to set in the frontend; the default (45/45/10) is a
stated choice, not a fact. This module produces the normalised components and an
equal-weight reference; the interactive weighting happens in the UI.
"""

from __future__ import annotations

from .config import S0304, S2526


def _arsenal_combined(circ: dict, phys: dict) -> dict:
    """Two-force difficulty for Arsenal's two complete-data seasons, each component
    min-max normalised across the two eras."""
    field = circ["field_strength"]["by_season"]
    stab = circ["squad_stability"]["by_season"]
    fx = phys["fixture_congestion"]["by_season"]

    raw = {}
    for s in (S0304, S2526):
        raw[s] = {
            # title-race pressure as the relative index shown in the report (2003/04 = 1.00)
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
            # equal-weight reference; the frontend recomputes for any chosen weights
            "difficulty": round(sum(norm.values()) / len(comps), 3),
        }
    return {
        "components": comps,
        "weights": "reader-set (default 45/45/10); equal-weight reference stored",
        "normalisation": "min-max across Arsenal's two complete-data seasons",
        "by_era": by_era,
    }


def build(circ: dict, phys: dict) -> dict:
    return {
        "metric": "synthesis_d",
        "arsenal_combined": _arsenal_combined(circ, phys),
    }
