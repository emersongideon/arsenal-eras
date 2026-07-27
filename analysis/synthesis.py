"""Section D - synthesis.

Re-reads the measured expected-points model (Act-2 Poisson model) THROUGH the
Section-B circumstances: not just "did they beat their xG?" but "did they beat it
against a stronger or weaker field, with a more or less settled squad?"

This module only assembles measured numbers side by side. The cumulative *reading*
(which task looks harder) is presented in the frontend and labelled interpretation,
so measurement and interpretation stay separate.
"""

from __future__ import annotations

from .config import S0304, S2526

SEASONS = (S0304, S2526)


def build(model_by_season: dict, circumstances: dict) -> dict:
    """Combine model output with field-strength / squad context, per season."""
    margin = circumstances["margin_to_second"]["by_season"]
    shape = circumstances["league_shape"]["by_season"]
    cont = circumstances["squad_continuity"]["by_season"]

    per = {}
    for s in SEASONS:
        m = model_by_season[s]
        per[s] = {
            # measured model output (Act 2)
            "actual_points": m["actual_points"],
            "expected_points": m["expected_points"],
            "points_over_expected": m["points_over_expected"],
            # the field it was won against (fact / measured)
            "runner_up_points": margin[s]["runner_up_points"],
            "margin_to_second": margin[s]["margin"],
            "league_points_std": shape[s]["std"],
            # the squad it was won with (fact)
            "retention_pct": cont[s]["retention_pct"],
            "incoming": cont[s]["incoming"],
        }
    return {"by_season": per}
