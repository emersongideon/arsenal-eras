"""Act 3 (era-gap levers) and Act 4 (speculative thought experiment).

IMPORTANT - intellectual-honesty categories:
  * schedule_difficulty is DERIVED FROM DATA (measured-ish; a real computation on
    real results), though it uses looked-up final tables.
  * fixture_load is HISTORICAL FACT (sourced match counts).
  * the VAR lever and the whole Act-4 thought experiment are SPECULATIVE. Their
    numbers come from explicit assumptions, never from the xG model. Every
    assumption is returned alongside the number so the UI can show it.
"""

from __future__ import annotations

from . import config as C
from . import facts

# NOTE: `transforms` (and thus pandas) is imported lazily inside
# schedule_difficulty_lever so that the API - which only needs the pure-python
# thought_experiment() below - can import this module without pandas installed.


# ---------------------------------------------------------------------------
# Act 3 - the three levers
# ---------------------------------------------------------------------------
def var_lever() -> dict:
    """VAR did not exist in 2003/04 (PL introduced it in 2019/20).

    We cannot measure a counterfactual, so this is an explicitly SPECULATIVE
    directional estimate. Assumption: a modern title side is involved in roughly
    6-10 VAR interventions a season (disallowed goals, penalty awards/overturns),
    of which only a fraction are marginal enough to swing a result. We express
    the plausible net league-points impact as a symmetric-ish band, not a point
    estimate.
    """
    return {
        "category": "speculative",
        "headline": "VAR reviewable decisions did not exist in 2003/04.",
        "var_introduced": "2019/20",
        "assumptions": [
            "~6-10 VAR interventions per season involve a title-chasing side.",
            "Only marginal calls (tight offsides, handball penalties) plausibly change a result.",
            "Net points impact modelled as a band, centred near zero.",
        ],
        "estimated_points_swing": {"low": -3, "high": 2},
        "direction_note": (
            "Tighter offside/handball enforcement tends to remove a few "
            "'benefit-of-the-doubt' goals; direction for any one team is uncertain."
        ),
    }


def fixture_load_lever() -> dict:
    """Total competitive matches per season (fatigue proxy) - HISTORICAL FACT."""
    a, b = facts.FIXTURE_LOAD[C.S0304], facts.FIXTURE_LOAD[C.S2526]
    return {
        "category": "fact",
        "headline": "The 2025/26 side played more games, with a far heavier European load.",
        "by_competition": {C.S0304: a, C.S2526: b},
        "total": {C.S0304: a["total"], C.S2526: b["total"]},
        "european": {C.S0304: a["european"], C.S2526: b["european"]},
        "delta_total": b["total"] - a["total"],
        "delta_european": b["european"] - a["european"],
        "sources": [facts.SOURCES["arsenal_2003_04"], facts.SOURCES["ucl_2026_final"]],
    }


def schedule_difficulty_lever(matches_by_season: dict) -> dict:
    """PPG vs bottom-half opponents in each era - DERIVED FROM RESULTS.

    `matches_by_season` maps season -> that season's per-match DataFrame.
    """
    from .transforms import schedule_difficulty  # lazy: keeps pandas off the API path

    out = {
        "category": "measured",
        "headline": "How many points each side took off the division's weaker half.",
        "by_season": {},
    }
    for season, df in matches_by_season.items():
        out["by_season"][season] = schedule_difficulty(
            df, facts.bottom_half_teams(season), facts.top_teams(season)
        )
    out["sources"] = [facts.SOURCES["pl_2003_04"], facts.SOURCES["pl_2025_26"]]
    return out


# ---------------------------------------------------------------------------
# Act 4 - the thought experiment (SPECULATIVE)
# ---------------------------------------------------------------------------
# Fixed assumption bands for the two non-interactive levers. Each is a plausible
# points adjustment applied to the Invincibles if dropped into 2025/26 conditions.
FATIGUE_BAND = (-3.0, -1.0)  # heavier fixture/European load costs 1-3 pts
DEPTH_BAND = (-4.0, 0.0)  # a deeper, more physical modern division costs 0-4 pts

# The interactive lever: VAR impact, in league points. The user drags this.
VAR_SLIDER = {"min": -6.0, "max": 3.0, "default": -1.0, "step": 0.5}


def thought_experiment(base_points: int, var_points: float = VAR_SLIDER["default"]) -> dict:
    """Transpose the Invincibles' points into 2025/26 conditions as a RANGE.

    This is deliberately a band, never a single number. `var_points` is the one
    assumption the UI lets the user flex; the fatigue and depth bands are fixed.
    The same arithmetic is mirrored on the frontend so the slider updates live -
    keeping this function the single source of truth.
    """
    var_points = max(VAR_SLIDER["min"], min(VAR_SLIDER["max"], float(var_points)))
    low = base_points + FATIGUE_BAND[0] + DEPTH_BAND[0] + var_points
    high = base_points + FATIGUE_BAND[1] + DEPTH_BAND[1] + var_points
    return {
        "category": "speculative",
        "base_points": base_points,
        "var_points": round(var_points, 2),
        "range": {"low": round(low, 1), "high": round(high, 1)},
        "midpoint": round((low + high) / 2, 1),
    }


def thought_experiment_spec(base_points: int) -> dict:
    """Full Act-4 payload: the formula, its components, assumptions and slider."""
    default = thought_experiment(base_points)
    return {
        "category": "speculative",
        "disclaimer": (
            "This is my speculative extrapolation, not a measurement. It transposes "
            "the 2003/04 side into 2025/26 conditions using explicit, adjustable "
            "assumptions. The output is a range; treat single numbers with suspicion."
        ),
        "base_points": base_points,
        "components": [
            {
                "name": "Fixture / European load",
                "band": list(FATIGUE_BAND),
                "assumption": "63 vs 59 games and 15 vs 10 European nights cost 1-3 league points.",
            },
            {
                "name": "Competitive depth",
                "band": list(DEPTH_BAND),
                "assumption": "A deeper, more physical modern division costs 0-4 points "
                "off the weaker half.",
            },
            {
                "name": "VAR (interactive)",
                "band": [VAR_SLIDER["min"], VAR_SLIDER["max"]],
                "assumption": "Reviewable decisions could help or hurt; you set this one.",
            },
        ],
        "var_slider": VAR_SLIDER,
        "default": default,
        # A few precomputed points on the slider so the client can sanity-check
        # its own arithmetic against the server's.
        "samples": [
            thought_experiment(base_points, v)
            for v in (VAR_SLIDER["min"], VAR_SLIDER["default"], VAR_SLIDER["max"])
        ],
    }
