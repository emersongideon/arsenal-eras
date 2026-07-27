"""Section B - "How hard was the task?" (the circumstances each title was won in).

Four measured sub-layers, all FACT or MEASURED (never fabricated):
  1. chasing_pack   - points of the teams that finished 2nd-4th
  2. margin_to_second - how close the title race was
  3. league_shape   - spread of points across the whole table (top-heavy vs deep)
  4. squad_continuity - how much the squad changed vs the prior season

Rival-team xG is NOT available for 2003/04 (Understat starts 2014/15; StatsBomb's
free data only covers Arsenal's own matches), so the chasing-pack comparison uses
actual points/goals for both eras and flags the xG gap. Suggested readings are
returned separately and labelled as interpretation by the frontend.
"""

from __future__ import annotations

import numpy as np

from . import facts, sources
from .config import S0304, S2526

SEASONS = (S0304, S2526)


def chasing_pack() -> dict:
    """Points of the top four finishers each season (actual results).

    xG for rival teams is unavailable for 2003/04, so this is points-based for both.
    """
    out = {
        "metric": "chasing_pack",
        "xg_note": (
            "Rival-team xG exists for 2025/26 (Understat) but not for 2003/04, so the "
            "chasing pack is compared on actual points - the fair like-for-like measure."
        ),
        "by_season": {},
    }
    for s in SEASONS:
        table = facts.FINAL_TABLE[s]
        out["by_season"][s] = {
            "top4": [{"pos": i + 1, "team": t, "points": p} for i, (t, p) in enumerate(table[:4])],
            "champion_points": table[0][1],
            "runner_up_points": table[1][1],
        }
    return out


def margin_to_second() -> dict:
    """Champion's points minus the runner-up's (title-race closeness)."""
    out = {"metric": "margin_to_second", "by_season": {}}
    for s in SEASONS:
        table = facts.FINAL_TABLE[s]
        out["by_season"][s] = {
            "champion": table[0][0],
            "champion_points": table[0][1],
            "runner_up": table[1][0],
            "runner_up_points": table[1][1],
            "margin": table[0][1] - table[1][1],
        }
    return out


def league_shape() -> dict:
    """Distribution of points across all 20 teams (top-heavy vs deep league)."""
    out = {"metric": "league_shape", "by_season": {}}
    for s in SEASONS:
        pts = np.array([p for _, p in facts.FINAL_TABLE[s]], dtype=float)
        out["by_season"][s] = {
            "points": [int(p) for p in pts],
            "champion": int(pts[0]),
            "bottom": int(pts[-1]),
            "spread": int(pts[0] - pts[-1]),  # 1st minus 20th
            "std": round(float(pts.std(ddof=0)), 1),  # dispersion of the whole table
            "top6_mean": round(float(pts[:6].mean()), 1),
            "mid_mean": round(float(pts[6:14].mean()), 1),  # 7th-14th, the "middle"
            "relegation_cutoff": int(pts[16]),  # 17th = last safe place
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
        "chasing_pack": chasing_pack(),
        "margin_to_second": margin_to_second(),
        "league_shape": league_shape(),
        "squad_continuity": squad_continuity(),
        "sources": {
            "final_tables": [facts.SOURCES["pl_2003_04"], facts.SOURCES["pl_2025_26"]],
            "squads": [sources.SOURCES["arsenal_2002_03"], sources.SOURCES["arsenal_2024_25"]],
        },
    }
