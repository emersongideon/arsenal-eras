"""Unit tests for the circumstances / physical / synthesis section builders."""

from __future__ import annotations

import pandas as pd
import pytest

from analysis import circumstances, physical, sources, synthesis
from analysis.config import S0304, S2526


def test_margin_to_second_matches_final_tables():
    m = circumstances.margin_to_second()["by_season"]
    # Arsenal 90 - Chelsea 79 = 11; Arsenal 85 - Man City 78 = 7.
    assert m[S0304]["margin"] == 11
    assert m[S2526]["margin"] == 7


def test_league_shape_spread_is_first_minus_last():
    shape = circumstances.league_shape()["by_season"]
    assert shape[S0304]["spread"] == 90 - 33
    assert shape[S2526]["spread"] == 85 - 20
    assert len(shape[S0304]["points"]) == 20


def test_squad_continuity_counts_reconcile():
    c = circumstances.squad_continuity()["by_season"]
    for s in (S0304, S2526):
        v = c[s]
        # retained + incoming must equal the current squad size.
        assert v["retained"] + v["incoming"] == v["squad_size"]
        assert 0 <= v["retention_pct"] <= 100
    # The Invincibles squad was materially more settled than the 2025/26 squad.
    assert c[S0304]["retention_pct"] > c[S2526]["retention_pct"]


def test_fixture_congestion_totals_match_source():
    f = physical.fixture_congestion()["by_season"]
    assert f[S0304]["total_games"] == len(sources.FIXTURES[S0304])
    assert f[S2526]["total_games"] == len(sources.FIXTURES[S2526])
    # Rest gaps are positive and the min is a small number of days.
    assert f[S0304]["min_rest_days"] >= 1
    assert sum(m["games"] for m in f[S2526]["games_per_month"]) == f[S2526]["total_games"]


def test_squad_age_is_minutes_weighted():
    # Two players: an old one who played a lot, a young one barely used. The
    # minutes-weighted age should sit close to the heavily-used older player.
    players = pd.DataFrame(
        [
            {"season": S0304, "player": "Martin Keown", "minutes": 3000.0},
            {"season": S0304, "player": "Gaël Clichy", "minutes": 90.0},
        ]
    )
    a = physical.squad_age(players)["by_season"][S0304]
    assert a["minutes_weighted_age"] > a["simple_mean_age"]  # weight pulls toward Keown
    assert a["oldest"] > a["youngest"]


def test_synthesis_combines_model_and_circumstances():
    model_by_season = {
        S0304: {"actual_points": 90, "expected_points": 69.4, "points_over_expected": 20.6},
        S2526: {"actual_points": 85, "expected_points": 69.2, "points_over_expected": 15.8},
    }
    out = synthesis.build(model_by_season, circumstances.build())["by_season"]
    assert out[S0304]["points_over_expected"] == pytest.approx(20.6)
    assert out[S0304]["margin_to_second"] == 11
    assert (
        out[S2526]["incoming"] == circumstances.squad_continuity()["by_season"][S2526]["incoming"]
    )
