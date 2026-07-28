"""Section D - "Performance under congestion".

Synthesises Section C (fixture rest-gaps) with Section A (match results) to test
one question: did the heavier, more compressed 2025/26 schedule actually show up
in dropped league points, or did the side absorb it?

Method (stated so it is auditable):
- Points only exist for LEAGUE games (cups are knockout), so points-per-game is
  computed over the 38 Premier League matches per season.
- The REST before each league game is measured from the FULL fixture list, across
  ALL competitions (a midweek cup or European game tires the side just as a league
  game does). This is the same rest-gap used in Section C.
- Each league game is split into "short rest" (<= 3 days) or "normal rest" (4+
  days). The season opener has no preceding competitive match; its long pre-season
  rest is counted as normal.

Small samples: the short-rest buckets are ~10-12 games, so per-bucket PPG is noisy.
The payload carries the game counts so the frontend can keep them visible; no verdict
is drawn here.
"""

from __future__ import annotations

from datetime import date

import pandas as pd

from . import sources
from .config import S0304, S2526

SEASONS = (S0304, S2526)
SHORT_REST_MAX_DAYS = 3


def _all_comp_rest(season: str) -> dict[str, int | None]:
    """{league-match ISO date -> rest days before it}, where rest is the gap to the
    previous competitive match in ANY competition (None for the season opener)."""
    fixtures = sorted(sources.FIXTURES[season])  # (ISO date, competition), chronological
    rest: dict[str, int | None] = {}
    prev: date | None = None
    for d, comp in fixtures:
        cur = date.fromisoformat(d)
        gap = None if prev is None else (cur - prev).days
        if comp == "Premier League":
            rest[d] = gap
        prev = cur
    return rest


def build(matches: pd.DataFrame) -> dict:
    """Per-season league PPG split by rest bucket, plus the overall-PPG baseline."""
    out = {
        "metric": "congestion_performance",
        "rest_basis": "all_competition",
        "short_rest_max_days": SHORT_REST_MAX_DAYS,
        "note": (
            "Points-per-game over the 38 league games; rest measured from every "
            "competition. Short-rest buckets are small (~10-12 games), so treat the "
            "per-bucket PPG as indicative, not decisive."
        ),
        "by_season": {},
    }
    for s in SEASONS:
        rest = _all_comp_rest(s)
        league = matches[matches["season"] == s]

        agg = {"short": {"games": 0, "points": 0}, "normal": {"games": 0, "points": 0}}
        for _, m in league.iterrows():
            gap = rest.get(m["date"])
            key = "short" if (gap is not None and gap <= SHORT_REST_MAX_DAYS) else "normal"
            agg[key]["games"] += 1
            agg[key]["points"] += int(m["points"])

        total_points = int(league["points"].sum())
        total_games = int(len(league))
        out["by_season"][s] = {
            "overall_games": total_games,
            "overall_points": total_points,
            "overall_ppg": round(total_points / total_games, 3),
            "buckets": {
                k: {
                    "games": v["games"],
                    "points": v["points"],
                    "ppg": round(v["points"] / v["games"], 3) if v["games"] else None,
                }
                for k, v in agg.items()
            },
        }
    return out
