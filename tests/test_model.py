"""Unit tests for the expected-points model."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from analysis import model


def test_outcome_probs_sum_to_one():
    # The scoreline grid is truncated at MAX_GOALS, so a negligible tail
    # (P(>10 goals), ~2e-5) is dropped; the probabilities sum to ~1, not exactly.
    for lf, la in [(1.5, 1.1), (0.3, 2.2), (2.0, 2.0)]:
        p_win, p_draw, p_loss = model.match_outcome_probs(lf, la)
        assert p_win + p_draw + p_loss == pytest.approx(1.0, abs=1e-3)
        assert p_win + p_draw + p_loss <= 1.0  # truncation only loses mass


def test_equal_rates_symmetric():
    """Equal scoring rates => equal win and loss probability."""
    p_win, p_draw, p_loss = model.match_outcome_probs(1.4, 1.4)
    assert p_win == pytest.approx(p_loss, abs=1e-9)
    assert p_draw > 0


def test_higher_rate_raises_win_prob():
    """A higher lambda_for strictly increases win probability."""
    low, _, _ = model.match_outcome_probs(1.0, 1.2)
    high, _, _ = model.match_outcome_probs(2.5, 1.2)
    assert high > low


def test_expected_points_bounds():
    p_win, p_draw, _ = model.match_outcome_probs(3.0, 0.2)
    xpts = 3 * p_win + p_draw
    assert 0.0 <= xpts <= 3.0
    assert xpts > 2.0  # a heavy favourite should merit > 2 xpts


def _toy_matches() -> pd.DataFrame:
    # A tidy synthetic season: goals roughly track xG.
    rng = np.random.default_rng(0)
    xgf = rng.uniform(0.5, 2.5, size=20)
    xga = rng.uniform(0.5, 2.0, size=20)
    return pd.DataFrame(
        {
            "season": ["TEST"] * 20,
            "match_no": range(1, 21),
            "date": ["2020-01-01"] * 20,
            "opponent": [f"Team {i}" for i in range(20)],
            "venue": ["H", "A"] * 10,
            "gf": np.round(xgf).astype(int),
            "ga": np.round(xga).astype(int),
            "result": ["W"] * 20,
            "points": [3] * 20,
            "xgf": xgf,
            "xga": xga,
        }
    )


def test_goal_model_is_calibrated():
    """Sum of predicted goals should closely match sum of actual goals."""
    gm = model.fit_goal_model(_toy_matches())
    assert gm.pred_goal_sum == pytest.approx(gm.actual_goal_sum, rel=0.05)
    assert gm.n_obs == 40  # 20 matches x 2 perspectives


def test_rate_monotonic_in_xg():
    gm = model.fit_goal_model(_toy_matches())
    rates = gm.rate(np.array([0.2, 1.0, 2.5]))
    assert rates[0] < rates[1] < rates[2]


def test_season_model_result_shape():
    res = model.season_model_result(_toy_matches())
    assert res["actual_points"] == 60  # 20 wins in the toy data
    assert 0 <= res["expected_points"] <= 60
    assert len(res["matches"]) == 20
    assert {"xpts", "p_win", "lambda_for"} <= res["matches"][0].keys()
