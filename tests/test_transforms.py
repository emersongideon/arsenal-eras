"""Unit tests for the data-transform and era functions."""

from __future__ import annotations

import pandas as pd
import pytest

from analysis import era, transforms


def _matches() -> pd.DataFrame:
    return pd.DataFrame(
        [
            # season, match_no, date, opponent, venue, gf, ga, result, points, xgf, xga
            {
                "season": "S",
                "match_no": 1,
                "date": "d",
                "opponent": "Weak FC",
                "venue": "H",
                "gf": 3,
                "ga": 0,
                "result": "W",
                "points": 3,
                "xgf": 2.0,
                "xga": 0.5,
            },
            {
                "season": "S",
                "match_no": 2,
                "date": "d",
                "opponent": "Big FC",
                "venue": "A",
                "gf": 1,
                "ga": 1,
                "result": "D",
                "points": 1,
                "xgf": 1.0,
                "xga": 1.2,
            },
            {
                "season": "S",
                "match_no": 3,
                "date": "d",
                "opponent": "Weak FC",
                "venue": "A",
                "gf": 0,
                "ga": 2,
                "result": "L",
                "points": 0,
                "xgf": 0.7,
                "xga": 1.9,
            },
        ]
    )


def test_season_summary_counts():
    s = transforms.season_summary(_matches())
    assert (s["wins"], s["draws"], s["losses"]) == (1, 1, 1)
    assert s["points"] == 4
    assert s["goals_for"] == 4 and s["goals_against"] == 3
    assert s["goal_difference"] == 1
    assert s["unbeaten"] is False
    assert s["ppg"] == pytest.approx(4 / 3, abs=1e-3)


def test_season_summary_xg_fields():
    s = transforms.season_summary(_matches())
    assert s["xg_for"] == pytest.approx(3.7, abs=1e-6)
    assert s["xg_against"] == pytest.approx(3.6, abs=1e-6)
    # Finishing vs expectation: scored 4 on 3.7 xG => +0.3
    assert s["goals_minus_xg_for"] == pytest.approx(0.3, abs=1e-6)


def test_rolling_form_and_cumulative_points():
    out = transforms.add_rolling_form(_matches(), n=2)
    out = out.sort_values("match_no")
    # cumulative points: 3, 4, 4
    assert list(out["cum_points"]) == [3, 4, 4]
    # 2-match rolling mean of xgf at match 2 = mean(2.0, 1.0) = 1.5
    assert out.iloc[1]["roll_xgf"] == pytest.approx(1.5, abs=1e-6)


def test_player_table_derived_columns():
    players = pd.DataFrame(
        [
            {
                "season": "S",
                "player": "Striker",
                "position": "F",
                "apps": 10,
                "minutes": 900.0,
                "shots": 30,
                "goals": 12,
                "xg": 9.0,
                "assists": 2.0,
                "xa": 1.5,
                "npg": 10.0,
                "npxg": 7.0,
            }
        ]
    )
    t = transforms.player_table(players)
    row = t.iloc[0]
    assert row["goals_minus_xg"] == pytest.approx(3.0)  # 12 - 9
    assert row["xg_per_90"] == pytest.approx(0.9)  # 9 / 900 * 90
    assert row["xg_per_shot"] == pytest.approx(0.3)  # 9 / 30


def test_schedule_difficulty_filters_by_opponent():
    sd = transforms.schedule_difficulty(_matches(), bottom_half={"Weak FC"}, top={"Big FC"})
    # Two games vs Weak FC (3pts + 0pts) => 1.5 ppg over 2 games
    assert sd["games_vs_bottom_half"] == 2
    assert sd["ppg_vs_bottom_half"] == pytest.approx(1.5)
    assert sd["points_dropped_vs_bottom_half"] == 3  # 6 available - 3 taken
    assert sd["games_vs_top_rivals"] == 1


def test_thought_experiment_is_a_range():
    te = era.thought_experiment(base_points=90, var_points=0.0)
    assert te["range"]["low"] < te["range"]["high"]
    assert te["category"] == "speculative"


def test_thought_experiment_var_is_monotonic_and_clamped():
    low_var = era.thought_experiment(90, var_points=-6.0)["midpoint"]
    high_var = era.thought_experiment(90, var_points=3.0)["midpoint"]
    assert high_var > low_var
    # Values beyond the slider bounds are clamped, not extrapolated.
    clamped = era.thought_experiment(90, var_points=999.0)["var_points"]
    assert clamped == era.VAR_SLIDER["max"]
