"""Cleaning, joining and aggregation on the canonical frames (pandas)."""
from __future__ import annotations

import numpy as np
import pandas as pd

from . import config as C


def season_summary(matches: pd.DataFrame) -> dict:
    """Collapse a season's per-match frame into headline totals (groupby-style).

    Works for one season's rows; returns the record used by the "Meet the teams"
    cards and Act 1.
    """
    g = matches
    played = len(g)
    wins = int((g["result"] == "W").sum())
    draws = int((g["result"] == "D").sum())
    losses = int((g["result"] == "L").sum())
    points = int(g["points"].sum())
    gf, ga = int(g["gf"].sum()), int(g["ga"].sum())
    xgf, xga = float(g["xgf"].sum()), float(g["xga"].sum())
    return {
        "season": g["season"].iloc[0],
        "played": played,
        "wins": wins, "draws": draws, "losses": losses,
        "points": points,
        "ppg": round(points / played, 3),
        "goals_for": gf, "goals_against": ga, "goal_difference": gf - ga,
        "xg_for": round(xgf, 2), "xg_against": round(xga, 2),
        "xg_difference": round(xgf - xga, 2),
        "unbeaten": losses == 0,
        # Finishing / defending vs expectation (descriptive):
        "goals_minus_xg_for": round(gf - xgf, 2),
        "goals_minus_xg_against": round(ga - xga, 2),
    }


def all_season_summaries(matches: pd.DataFrame) -> pd.DataFrame:
    """One summary row per season (real groupby over the combined frame)."""
    return (
        matches.groupby("season", sort=False, group_keys=False)
        .apply(lambda df: pd.Series(season_summary(df)))
        .reset_index(drop=True)
    )


def add_rolling_form(matches: pd.DataFrame, n: int = C.ROLLING_N) -> pd.DataFrame:
    """Add rolling xG-for / against / difference (trailing n-match mean).

    Computed within each season, ordered by match number - a genuine rolling
    window, used for the Act 1 momentum chart.
    """
    out = matches.sort_values(["season", "match_no"]).copy()
    for col in ("xgf", "xga"):
        out[f"roll_{col}"] = (
            out.groupby("season")[col]
            .transform(lambda s: s.rolling(n, min_periods=1).mean())
            .round(3)
        )
    out["roll_xgd"] = (out["roll_xgf"] - out["roll_xga"]).round(3)
    out["cum_points"] = out.groupby("season")["points"].cumsum()
    return out


def player_table(players: pd.DataFrame) -> pd.DataFrame:
    """Derive per-player analytics columns and order by xG."""
    df = players.copy()
    mins = df["minutes"].replace(0, np.nan)
    df["goals_minus_xg"] = (df["goals"] - df["xg"]).round(2)
    df["xg_per_90"] = (df["xg"] / mins * C.PER90_BASE).round(3).fillna(0.0)
    df["goals_per_90"] = (df["goals"] / mins * C.PER90_BASE).round(3).fillna(0.0)
    df["xg_per_shot"] = (df["xg"] / df["shots"].replace(0, np.nan)).round(3).fillna(0.0)
    return df.sort_values(["season", "xg"], ascending=[True, False]).reset_index(drop=True)


def schedule_difficulty(
    matches: pd.DataFrame, bottom_half: set[str], top: set[str]
) -> dict:
    """Points-per-game split by opponent strength (a competitive-depth proxy).

    Uses a merge-free membership filter on the pre-computed final-table sets.
    Returns PPG vs bottom-half (11th-20th) and vs the top rivals (2nd-6th).
    """
    def ppg(sub: pd.DataFrame) -> float:
        return round(sub["points"].sum() / len(sub), 3) if len(sub) else 0.0

    vs_bottom = matches[matches["opponent"].isin(bottom_half)]
    vs_top = matches[matches["opponent"].isin(top)]
    return {
        "ppg_overall": ppg(matches),
        "ppg_vs_bottom_half": ppg(vs_bottom),
        "ppg_vs_top_rivals": ppg(vs_top),
        "games_vs_bottom_half": int(len(vs_bottom)),
        "games_vs_top_rivals": int(len(vs_top)),
        "points_vs_bottom_half": int(vs_bottom["points"].sum()),
        "points_dropped_vs_bottom_half": int(3 * len(vs_bottom) - vs_bottom["points"].sum()),
    }
