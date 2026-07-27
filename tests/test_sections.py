"""Unit tests for the circumstances / physical / synthesis section builders."""

from __future__ import annotations

import pandas as pd
import pytest

from analysis import circumstances, physical, sources, synthesis
from analysis.config import S0304, S2526


def test_field_strength_margin_matches_final_tables():
    f = circumstances.field_strength()["by_season"]
    # Arsenal 90 - Chelsea 79 = 11; Arsenal 85 - Man City 78 = 7.
    assert f[S0304]["margin"] == 11
    assert f[S2526]["margin"] == 7
    # 19 rivals contribute to the pressure index each season.
    assert len(f[S0304]["contributions"]) == 19


def test_pressure_index_higher_for_more_bunched_field():
    f = circumstances.field_strength()["by_season"]
    # 2025/26's chasing pack finished closer, so it faced more title-race pressure,
    # and that ordering must hold across every decay scale (not a TAU artefact).
    assert f[S2526]["pressure_index"] > f[S0304]["pressure_index"]
    for tau, cpi in f[S2526]["pressure_by_tau"].items():
        assert cpi > f[S0304]["pressure_by_tau"][tau]


def test_pressure_contribution_decays_with_gap():
    # A closer rival (smaller gap) must contribute more pressure than a distant one.
    contribs = circumstances.field_strength()["by_season"][S2526]["contributions"]
    by_gap = sorted(contribs, key=lambda c: c["gap"])
    assert by_gap[0]["pressure"] > by_gap[-1]["pressure"]


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
