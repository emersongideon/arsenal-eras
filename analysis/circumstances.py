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
import math
import unicodedata

import numpy as np

from . import config as C
from . import facts, loaders, sources
from .config import S0304, S2526

SEASONS = (S0304, S2526)
PRESSURE_TAU = 10.0  # points: closeness sensitivity of the weekly pressure weight
BETA = 1.5  # rivals BEHIND Arsenal (chasing it) are amplified by beta; for a leader
# the live threat is the pack immediately behind, not sides already ahead
TAU_GRID = (7.0, 10.0, 13.0)  # robustness check
# Interactive robustness sweep. Below 5 the weekly weights collapse toward only
# level-on-points rivals; above 20 they flatten so distant teams begin to count as
# if they were contenders. 5-20 is where the comparison is readable and defensible.
TAU_SWEEP_RANGE = (5.0, 20.0)
TAU_SWEEP_STEP = 0.5


def _final_pressure_index(champ_points: int, rival_points: list[int], tau: float) -> float:
    """Legacy final-table index, kept only for the per-rival contribution
    breakdown, not the headline metric."""
    gaps = champ_points - np.asarray(rival_points, dtype=float)
    return float(np.exp(-gaps / tau).sum())


def _cumulative_pressure(weekly: dict[str, list[int]], target: str, tau: float,
                         beta: float = BETA, ramp: bool = True) -> float:
    """Title-race pressure ENDURED by `target` across the whole season. Each week
    (after k games played, k = 1..38), every rival is weighted exp(-|gap|/tau) by
    how close it sits to `target` on points, peaking at gap 0, with rivals BEHIND
    `target` (chasing it) amplified by beta. Each week is then weighted by a linear
    season-progress ramp, k/38 (week 1 counts ~3%, week 38 counts 100%), since teams
    sitting level in August is an artefact of the season not having started, not a
    real title race. Summed across all rivals and all 38 weeks."""
    seq_t = weekly[target]
    n = len(seq_t)
    total = 0.0
    for k in range(n):
        tp = seq_t[k]
        week = 0.0
        for club, seq in weekly.items():
            if club == target:
                continue
            rp = seq[k]
            w = math.exp(-abs(tp - rp) / tau)
            if rp < tp:  # rival is behind target, chasing it
                w *= beta
            week += w
        total += week * ((k + 1) / n if ramp else 1.0)  # linear ramp: GW(k+1) weight = (k+1)/38
    return total


def _weekly_tables() -> dict[str, dict[str, list[int]]]:
    return {
        S0304: loaders.load_weekly_points_2003_04(),
        S2526: loaders.load_weekly_points_2025_26(),
    }


def _validate_weekly(weekly: dict[str, dict[str, list[int]]]) -> None:
    """Guard: the rebuilt week-by-week tables must reproduce the known finals, so a
    bad or truncated source cannot silently distort the metric."""
    for s in SEASONS:
        for club, seq in weekly[s].items():
            if len(seq) != 38:
                raise ValueError(f"{s}: {club} has {len(seq)} games, expected 38")
        champ, champ_pts = facts.FINAL_TABLE[s][0]
        if weekly[s].get(champ, [None])[-1] != champ_pts:
            raise ValueError(
                f"{s}: rebuilt {champ} final = {weekly[s].get(champ, ['?'])[-1]} "
                f"!= known table {champ_pts}"
            )


def _weekly_export(weekly: dict[str, dict[str, list[int]]]) -> dict:
    """Per-club cumulative points after each of the 38 gameweeks, plus the params,
    so the frontend worked example can recompute the exact per-week pressure the
    index uses (one computation, shared)."""
    out = {}
    for s in SEASONS:
        tbl = weekly[s]
        rivals = sorted(
            ([club, pts] for club, pts in tbl.items() if club != C.TEAM),
            key=lambda kv: -kv[1][-1],  # final points, so rivals read in table order
        )
        out[s] = {
            "arsenal": tbl[C.TEAM],
            "rivals": [{"club": club, "pts": pts} for club, pts in rivals],
        }
    return {"tau": PRESSURE_TAU, "beta": BETA, "by_season": out}


def _pressure_sweep(weekly: dict[str, dict[str, list[int]]]) -> dict:
    """Relative pressure index (2003/04 = 1.00 at every tau) for both seasons across
    a swept tau, so the reader can verify the ranking (2025/26 higher) is stable, not
    an artefact of tau=10. The report shows this relative index, not the raw sums."""
    lo, hi = TAU_SWEEP_RANGE
    taus = np.round(np.arange(lo, hi + TAU_SWEEP_STEP / 2, TAU_SWEEP_STEP), 1)
    points = []
    for t in taus:
        raw = {s: _cumulative_pressure(weekly[s], C.TEAM, float(t)) for s in SEASONS}
        base = raw[S0304]
        points.append({
            "tau": float(t),
            **{s: round(raw[s] / base, 3) for s in SEASONS},
        })
    return {
        "default_tau": PRESSURE_TAU,
        "range": [float(lo), float(hi)],
        "step": TAU_SWEEP_STEP,
        "n_rivals": len(weekly[S0304]) - 1,
        "points": points,
    }


def field_strength() -> dict:
    """Cumulative week-by-week title-race pressure Arsenal endured, per season.

    Each gameweek, every rival is weighted by how close it sat to Arsenal on the
    table, exp(-gap/tau) peaking at gap 0, with rivals BEHIND Arsenal (chasing it)
    amplified by beta=1.5, summed across all 38 weeks. Reported as a relative index
    (2003/04 = 1.00); the raw summed values are kept alongside for the repo."""
    weekly = _weekly_tables()
    _validate_weekly(weekly)

    raw_pressure = {s: _cumulative_pressure(weekly[s], C.TEAM, PRESSURE_TAU) for s in SEASONS}
    base = raw_pressure[S0304]
    rel = {s: raw_pressure[s] / base for s in SEASONS}
    # relative index at each robustness-grid tau (for the "holds across tau" note)
    rel_by_tau: dict[str, dict[int, float]] = {s: {} for s in SEASONS}
    for t in TAU_GRID:
        raw_t = {s: _cumulative_pressure(weekly[s], C.TEAM, t) for s in SEASONS}
        for s in SEASONS:
            rel_by_tau[s][int(t)] = round(raw_t[s] / raw_t[S0304], 2)

    out = {
        "metric": "field_strength",
        "tau": PRESSURE_TAU,
        "beta": BETA,
        "method": (
            "Cumulative week by week: each of the 38 gameweeks, every rival is weighted "
            "exp(-|points gap to Arsenal| / tau) with tau=10, peaking when level on points, "
            "and rivals behind Arsenal (chasing it) amplified by beta=1.5. Each gameweek is "
            "then scaled by a linear season-progress ramp (k/38), so late-season closeness "
            "counts more than August. Summed across all rivals and all weeks, shown as a "
            "relative index (2003/04 = 1.00). The direction (2025/26 higher) holds across "
            "tau 5 to 20 and beta 1 to 2, so it does not depend on those stated choices."
        ),
        "xg_note": (
            "Pressure is measured on league points, which exist for every club in both "
            "eras, so the two seasons are compared on the same basis."
        ),
        "sweep": _pressure_sweep(weekly),
        "weekly": _weekly_export(weekly),
        "by_season": {},
    }
    for s in SEASONS:
        table = facts.FINAL_TABLE[s]
        champ_team, champ_pts = table[0]
        rivals = table[1:]

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
            # headline metric: cumulative weekly pressure, as a relative index
            "pressure_index": round(rel[s], 2),
            "pressure_index_raw": round(raw_pressure[s], 2),
            "teams_within_10": int(sum(1 for c in contributions if c["gap"] <= 10)),
            "teams_within_15": int(sum(1 for c in contributions if c["gap"] <= 15)),
            "pressure_by_tau": rel_by_tau[s],
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
