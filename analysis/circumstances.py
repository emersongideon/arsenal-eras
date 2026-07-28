"""Section B - "How hard was the task?" (the circumstances each title was won in).

Two sub-layers:
  1. field_strength  - a title-race PRESSURE INDEX over the whole table (all 19
     rivals), weighting each rival by how close they finished. This merges the
     shallow "who came 2nd/3rd/4th", "winning margin" and "points spread" views
     into one analytical number.
  2. squad_stability - how much upheaval each squad absorbed vs the prior season:
     players retained, players joined, and players departed weighted by the minutes
     those players had played the season before (so losing a regular counts more
     than losing a squad filler).

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

import json
import unicodedata

import numpy as np

from . import config as C
from . import facts, sources
from .config import S0304, S2526

SEASONS = (S0304, S2526)
PRESSURE_TAU = 10.0  # points: decay scale for title-race pressure
TAU_GRID = (7.0, 10.0, 13.0)  # robustness check
# Interactive robustness sweep: below 5 both indices sit near zero (unreadable);
# above 20 the "effective threats" reading degrades (distant relegation sides start
# to count) and the two curves converge toward n_rivals=19. 5-20 is the region where
# the comparison is both readable and defensible. See WALKTHROUGH.md.
TAU_SWEEP_RANGE = (5.0, 20.0)
TAU_SWEEP_STEP = 0.5


def _pressure_index(champ_points: int, rival_points: list[int], tau: float) -> float:
    gaps = champ_points - np.asarray(rival_points, dtype=float)
    return float(np.exp(-gaps / tau).sum())


def _pressure_sweep() -> dict:
    """Pressure index for both seasons across a swept decay scale tau, so the
    reader can verify the ranking (2025/26 > 2003/04) is stable, not an artefact
    of tau=10. Computed here in the pipeline; the frontend only reads the JSON."""
    lo, hi = TAU_SWEEP_RANGE
    taus = np.round(np.arange(lo, hi + TAU_SWEEP_STEP / 2, TAU_SWEEP_STEP), 1)
    rival_pts = {
        s: [p for _, p in facts.FINAL_TABLE[s][1:]] for s in SEASONS
    }
    champ_pts = {s: facts.FINAL_TABLE[s][0][1] for s in SEASONS}
    points = [
        {
            "tau": float(t),
            **{s: round(_pressure_index(champ_pts[s], rival_pts[s], float(t)), 3) for s in SEASONS},
        }
        for t in taus
    ]
    return {
        "default_tau": PRESSURE_TAU,
        "range": [float(lo), float(hi)],
        "step": TAU_SWEEP_STEP,
        "n_rivals": len(rival_pts[SEASONS[0]]),
        "points": points,
    }


def field_strength() -> dict:
    """Title-race pressure index over the whole 20-team table, per season."""
    out = {
        "metric": "field_strength",
        "tau": PRESSURE_TAU,
        "xg_note": (
            "Rival-team xG exists for 2025/26 (Understat) but not for 2003/04, so the "
            "field is measured on actual points - the fair like-for-like measure."
        ),
        "sweep": _pressure_sweep(),
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


def _norm_name(name: str) -> str:
    """Accent- and case-insensitive key for matching names across data sources."""
    stripped = "".join(
        c for c in unicodedata.normalize("NFKD", name) if not unicodedata.combining(c)
    )
    return stripped.lower().replace(".", "").strip()

# A departed player's name in the curated squad list can differ in spelling from
# the minutes source. Maps a source-name key -> the curated squad-list name.
_MINUTES_NAME_ALIAS = {
    "oleh luzhny": "Oleh Luzhnyi",  # FBref spelling -> squad-list spelling
    "edu gaspar": "Edu",
}

# Prior-season minutes source per title season: (cache file, name field, minutes field).
# 2002/03 from FBref (via Wayback); 2024/25 from Understat. See config / sources.py.
_PRIOR_MINUTES_SOURCE = {
    S0304: (C.FBREF_2002_03_FILE, "player", "minutes"),
    S2526: (C.UNDERSTAT_2024_25_FILE, "player_name", "time"),
}


def _prior_minutes(season: str) -> tuple[float, dict[str, float]]:
    """Total prior-season team minutes and a {normalised-name: minutes} map."""
    path, name_key, min_key = _PRIOR_MINUTES_SOURCE[season]
    rows = json.loads(path.read_text())["players"]
    by_name: dict[str, float] = {}
    total = 0.0
    for p in rows:
        mins = float(p[min_key] or 0)
        total += mins
        by_name[_norm_name(p[name_key])] = mins
    return total, by_name


def squad_stability() -> dict:
    """Upheaval each squad absorbed vs the prior season: retained / joined /
    departed counts, plus departures weighted by the minutes those players had
    played the season before (share of the prior season's total team minutes).
    Retention is expressed as a share of the title-winning squad."""
    prior = {S0304: "2002/03", S2526: "2024/25"}
    out = {"metric": "squad_stability", "by_season": {}}
    for s in SEASONS:
        cur = set(sources.SQUAD_PL[s])
        prev = list(dict.fromkeys(sources.SQUAD_PL[prior[s]]))
        prev_set = set(prev)
        retained = [p for p in prev if p in cur]
        joined = [p for p in cur if p not in prev_set]
        departed = [p for p in prev if p not in cur]

        total_min, by_name = _prior_minutes(s)
        departed_min = 0.0
        for d in departed:
            key = _norm_name(d)
            mins = by_name.get(key)
            if mins is None:  # try the cross-source spelling aliases
                for src_key, canon in _MINUTES_NAME_ALIAS.items():
                    if canon == d and src_key in by_name:
                        mins = by_name[src_key]
                        break
            if mins is None:
                raise ValueError(
                    f"{s}: no prior-season minutes found for departed player {d!r}"
                )
            departed_min += mins

        out["by_season"][s] = {
            "prior_season": prior[s],
            "squad_size": len(cur),
            "retained": len(retained),
            "incoming": len(joined),
            "outgoing": len(departed),
            # retention as a share of THIS season's title-winning squad
            "retention_pct": round(100 * len(retained) / len(cur), 1),
            "prior_total_minutes": round(total_min),
            "departed_minutes": round(departed_min),
            "departed_minutes_pct": round(100 * departed_min / total_min, 1),
        }
    return out


def build() -> dict:
    """Assemble the whole Section-B payload."""
    return {
        "field_strength": field_strength(),
        "squad_stability": squad_stability(),
        "sources": {
            "final_tables": [facts.SOURCES["pl_2003_04"], facts.SOURCES["pl_2025_26"]],
            "squads": [sources.SOURCES["arsenal_2002_03"], sources.SOURCES["arsenal_2024_25"]],
            "squad_minutes": [
                sources.SOURCES["arsenal_2002_03_minutes"],
                sources.SOURCES["arsenal_2024_25_minutes"],
            ],
        },
    }
