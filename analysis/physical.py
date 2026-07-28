"""Section C - "The physical toll".

STRICT RULE: only metrics with solid data for BOTH 2003/04 and 2025/26.
  1. squad_age         - minutes-weighted mean age (birthdates + league minutes)
  2. fixture_congestion - games/month and rest-gaps, from real all-competition dates

Deliberately EXCLUDED: running distance, high-intensity sprints, GPS/tracking,
recovery and travel data. None of it has a 2003/04 equivalent, so comparing it
would be dishonest. That gap is surfaced as a credibility note, not papered over.
"""

from __future__ import annotations

from datetime import date

import numpy as np
import pandas as pd

from . import sources
from .config import S0304, S2526

SEASONS = (S0304, S2526)

TRACKING_NOTE = (
    "Modern physical-tracking data (distance covered, high-intensity sprints, GPS "
    "load, recovery) has no 2003/04 equivalent, so it is not compared here. Only "
    "metrics available for both eras - age and fixture dates - are used."
)


def _age_years(birth: str, ref: str) -> float:
    b, r = date.fromisoformat(birth), date.fromisoformat(ref)
    return (r - b).days / 365.25


def squad_age(players: pd.DataFrame) -> dict:
    """Minutes-weighted mean age per season (weighted by that season's PL minutes).

    Minutes-weighting matters: it answers "how old was the team that actually took
    the field", not the flat roster average which a bench of teenagers would skew.
    """
    out = {"metric": "squad_age", "by_season": {}}
    for s in SEASONS:
        ref = sources.AGE_REFERENCE[s]
        df = players[(players["season"] == s) & (players["minutes"] > 0)].copy()
        if df.empty:  # nothing to weight for this season
            continue
        df["age"] = df["player"].map(lambda n, r=ref: _age_years(sources.BIRTHDATE[n], r))
        w = df["minutes"].to_numpy()
        ages = df["age"].to_numpy()
        weighted = float(np.average(ages, weights=w))
        # per-player rows for the scatter (age vs minutes; dot size = minutes),
        # heaviest-minutes first. Display label only; age/minutes are the data.
        per_player = [
            {
                "name": sources.PLAYER_DISPLAY_NAME.get(r.player, r.player),
                "age": round(float(r.age), 1),
                "minutes": round(float(r.minutes), 1),
            }
            for r in df.sort_values("minutes", ascending=False).itertuples()
        ]
        out["by_season"][s] = {
            "reference_date": ref,
            "minutes_weighted_age": round(weighted, 1),
            "simple_mean_age": round(float(ages.mean()), 1),
            "youngest": round(float(ages.min()), 1),
            "oldest": round(float(ages.max()), 1),
            # share of on-pitch minutes played by under-23s and by 30-and-over
            "u23_minutes_share": round(float(w[ages < 23].sum() / w.sum()), 3),
            "over30_minutes_share": round(float(w[ages >= 30].sum() / w.sum()), 3),
            "players": per_player,
        }
    return out


def fixture_congestion() -> dict:
    """Games-per-month and rest-gaps across ALL competitions, from real dates."""
    out = {"metric": "fixture_congestion", "note": TRACKING_NOTE, "by_season": {}}
    for s in SEASONS:
        dates = pd.to_datetime(sorted(d for d, _ in sources.FIXTURES[s]))
        gaps = dates.to_series().diff().dt.days.dropna().to_numpy()

        # Games per calendar month, in chronological order.
        per_month = (
            pd.Series(1, index=dates)
            .resample("MS")
            .sum()
            .rename_axis("month")
            .reset_index(name="games")
        )
        per_month["label"] = per_month["month"].dt.strftime("%b %Y")

        out["by_season"][s] = {
            "total_games": int(len(dates)),
            "span_days": int((dates[-1] - dates[0]).days),
            "games_per_month": per_month[["label", "games"]].to_dict("records"),
            "busiest_month": per_month.loc[per_month["games"].idxmax(), "label"],
            "busiest_month_games": int(per_month["games"].max()),
            "min_rest_days": int(gaps.min()),
            "median_rest_days": round(float(np.median(gaps)), 1),
            # quick-turnaround games: <=3 clear days between matches
            "short_rest_count": int((gaps <= 3).sum()),
        }
    return out


def build(players: pd.DataFrame) -> dict:
    return {
        "squad_age": squad_age(players),
        "fixture_congestion": fixture_congestion(),
        "tracking_note": TRACKING_NOTE,
        "sources": {
            "fixtures": [sources.SOURCES["arsenal_2003_04"], sources.SOURCES["arsenal_2025_26"]],
            "birthdates": "Wikipedia player infoboxes",
        },
    }
