"""Section B - "How hard was the task?" (the circumstances each title was won in).

Two sub-layers:
  1. field_strength  - a title-race PRESSURE INDEX over the whole table (all 19
     rivals), weighting each rival by how close they finished. This merges the
     shallow "who came 2nd/3rd/4th", "winning margin" and "points spread" views
     into one analytical number.
  2. squad_continuity - how much the squad changed vs the prior season.

Rival-team xG is NOT available for 2003/04 (Understat starts 2014/15; StatsBomb's
free data only covers Arsenal's own matches), so the field is measured on actual
points for both eras.

The pressure index
------------------
A rival exerts real title pressure only when it finishes close on points; a team
30 points back was never a threat. So we weight each rival's contribution by an
exponential decay of its points gap to the champion:

    pressure_i = exp(-gap_i / TAU),   gap_i = champion_points - rival_points
    PRESSURE_INDEX = sum over all 19 rivals of pressure_i

`TAU` (points) sets how quickly pressure fades with distance. A rival level on
points contributes 1.0; one TAU points back contributes 1/e ~= 0.37; far-off teams
contribute ~0. The index reads as "the effective number of genuine title threats",
distance-discounted. It is highest when several teams finish near the champion -
exactly the situation that makes a title hard to win. To show it isn't an artefact
of the TAU choice, the index is also reported at a few TAU values (the ordering
between the two seasons holds throughout).
"""

from __future__ import annotations

import numpy as np

from . import facts, sources
from .config import S0304, S2526

SEASONS = (S0304, S2526)
PRESSURE_TAU = 10.0  # points: decay scale for title-race pressure
TAU_GRID = (7.0, 10.0, 13.0)  # robustness check


def _pressure_index(champ_points: int, rival_points: list[int], tau: float) -> float:
    gaps = champ_points - np.asarray(rival_points, dtype=float)
    return float(np.exp(-gaps / tau).sum())


def field_strength() -> dict:
    """Title-race pressure index over the whole 20-team table, per season."""
    out = {
        "metric": "field_strength",
        "tau": PRESSURE_TAU,
        "xg_note": (
            "Rival-team xG exists for 2025/26 (Understat) but not for 2003/04, so the "
            "field is measured on actual points - the fair like-for-like measure."
        ),
        "by_season": {},
    }
    for s in SEASONS:
        table = facts.FINAL_TABLE[s]
        champ_team, champ_pts = table[0]
        rivals = table[1:]  # the other 19 teams
        rival_pts = [p for _, p in rivals]

        contributions = []
        for pos, (team, pts) in enumerate(rivals, start=2):
            gap = champ_pts - pts
            contributions.append({
                "pos": pos,
                "team": team,
                "points": pts,
                "gap": gap,
                "pressure": round(float(np.exp(-gap / PRESSURE_TAU)), 3),
            })

        out["by_season"][s] = {
            "champion": champ_team,
            "champion_points": champ_pts,
            "runner_up": rivals[0][0],
            "runner_up_points": rivals[0][1],
            "margin": champ_pts - rivals[0][1],
            "pressure_index": round(_pressure_index(champ_pts, rival_pts, PRESSURE_TAU), 2),
            "teams_within_10": int(sum(1 for c in contributions if c["gap"] <= 10)),
            "teams_within_15": int(sum(1 for c in contributions if c["gap"] <= 15)),
            # ordering between seasons should be stable across these decay scales:
            "pressure_by_tau": {
                int(t): round(_pressure_index(champ_pts, rival_pts, t), 2) for t in TAU_GRID
            },
            "contributions": contributions,
        }
    return out


def squad_continuity() -> dict:
    """Retention / churn of the PL squad versus the prior season."""
    prior = {S0304: "2002/03", S2526: "2024/25"}
    out = {"metric": "squad_continuity", "by_season": {}}
    for s in SEASONS:
        cur = set(sources.SQUAD_PL[s])
        prev = set(sources.SQUAD_PL[prior[s]])
        retained = cur & prev
        out["by_season"][s] = {
            "prior_season": prior[s],
            "squad_size": len(cur),
            "retained": len(retained),
            "incoming": len(cur - prev),
            "outgoing": len(prev - cur),
            "retention_pct": round(100 * len(retained) / len(cur), 1),
        }
    return out


def build() -> dict:
    """Assemble the whole Section-B payload."""
    return {
        "field_strength": field_strength(),
        "squad_continuity": squad_continuity(),
        "sources": {
            "final_tables": [facts.SOURCES["pl_2003_04"], facts.SOURCES["pl_2025_26"]],
            "squads": [sources.SOURCES["arsenal_2002_03"], sources.SOURCES["arsenal_2024_25"]],
        },
    }
