"""Expected-points model: xG -> goals (Poisson GLM) -> match outcome probs.

Why Poisson-from-xG?
--------------------
Football goals are low-count, roughly independent events per team per match -
the textbook use-case for a Poisson process. Expected goals (xG) is already an
estimate of the *mean* number of goals a team "should" score from its chances,
which maps naturally onto the Poisson rate parameter lambda.

Rather than naively assuming goals == xG, we fit a Poisson GLM
(scikit-learn `PoissonRegressor`) of actual goals on xG. That calibrates the
relationship for each data source (StatsBomb 2003/04 and Understat 2025/26 use
different xG models, so their xG->goals scaling can differ). We fit on both the
attacking and defending perspective of every match (goals scored vs xGF, goals
conceded vs xGA) - 2 x 38 = 76 observations per season.

Given the calibrated rates lambda_for and lambda_against for a match, we treat
the two scorelines as independent Poisson variables and sum the outcome
probabilities into expected points (3*P(win) + 1*P(draw)). Summed over a season
that yields "expected points" - how many points the underlying performance
merited, independent of finishing/goalkeeping variance and luck.

Assumptions (stated, because this is the measured core):
  * Goals per team per match ~ Poisson(lambda).
  * The two teams' goal counts in a match are independent (a known simplification;
    real scorelines are mildly correlated - see README "what I'd add").
  * xG is a sufficient single predictor of the scoring rate.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from scipy.stats import poisson
from sklearn.linear_model import PoissonRegressor

MAX_GOALS = 10  # truncation for the scoreline grid; P(>10) is negligible


@dataclass
class GoalModel:
    """A fitted xG->goals Poisson GLM plus its calibration diagnostics."""

    model: PoissonRegressor
    intercept: float
    coef: float
    n_obs: int
    pred_goal_sum: float  # sum of predicted goals over training rows
    actual_goal_sum: int  # sum of actual goals over training rows

    def rate(self, xg: np.ndarray | float) -> np.ndarray:
        """Calibrated scoring rate lambda for given xG value(s)."""
        x = np.atleast_2d(np.asarray(xg, dtype=float).reshape(-1, 1))
        return self.model.predict(x)


def fit_goal_model(matches: pd.DataFrame) -> GoalModel:
    """Fit goals ~ xG on both perspectives of every match in `matches`.

    We stack (xGF -> GF) and (xGA -> GA) so the model learns a single
    xG->goals mapping from 2*N observations.
    """
    xg = np.concatenate([matches["xgf"].to_numpy(), matches["xga"].to_numpy()])
    goals = np.concatenate([matches["gf"].to_numpy(), matches["ga"].to_numpy()])
    X = xg.reshape(-1, 1)

    # alpha near zero => (essentially) maximum-likelihood Poisson GLM, not a
    # regularised fit; we want calibration, not shrinkage.
    reg = PoissonRegressor(alpha=1e-6, max_iter=500)
    reg.fit(X, goals)

    return GoalModel(
        model=reg,
        intercept=float(reg.intercept_),
        coef=float(reg.coef_[0]),
        n_obs=len(goals),
        pred_goal_sum=float(reg.predict(X).sum()),
        actual_goal_sum=int(goals.sum()),
    )


def match_outcome_probs(
    lam_for: float, lam_against: float, max_goals: int = MAX_GOALS
) -> tuple[float, float, float]:
    """P(win), P(draw), P(loss) for one match under independent Poisson goals."""
    k = np.arange(0, max_goals + 1)
    pf = poisson.pmf(k, lam_for)
    pa = poisson.pmf(k, lam_against)
    joint = np.outer(pf, pa)  # joint[i, j] = P(GF=i, GA=j)
    p_win = float(np.tril(joint, -1).sum())  # i > j
    p_draw = float(np.trace(joint))  # i == j
    p_loss = float(np.triu(joint, 1).sum())  # i < j
    return p_win, p_draw, p_loss


def expected_points_table(matches: pd.DataFrame, gm: GoalModel) -> pd.DataFrame:
    """Per-match expected points from the calibrated model."""
    out = matches.copy()
    lam_f = gm.rate(out["xgf"].to_numpy())
    lam_a = gm.rate(out["xga"].to_numpy())
    # lam_f and lam_a are the same length (one rate per match); strict=True asserts it.
    probs = [match_outcome_probs(f, a) for f, a in zip(lam_f, lam_a, strict=True)]
    out["lambda_for"] = np.round(lam_f, 3)
    out["lambda_against"] = np.round(lam_a, 3)
    out["p_win"] = [round(p[0], 3) for p in probs]
    out["p_draw"] = [round(p[1], 3) for p in probs]
    out["p_loss"] = [round(p[2], 3) for p in probs]
    out["xpts"] = [round(3 * p[0] + p[1], 3) for p in probs]
    return out


def season_model_result(matches: pd.DataFrame) -> dict:
    """Fit the model for one season and summarise expected vs actual points."""
    gm = fit_goal_model(matches)
    tbl = expected_points_table(matches, gm)

    actual = int(matches["points"].sum())
    expected = float(tbl["xpts"].sum())
    return {
        "season": matches["season"].iloc[0],
        "actual_points": actual,
        "expected_points": round(expected, 1),
        "points_over_expected": round(actual - expected, 1),
        "model": {
            "type": "PoissonRegressor(goals ~ xG)",
            "intercept": round(gm.intercept, 4),
            "coef": round(gm.coef, 4),
            "n_obs": gm.n_obs,
            # Calibration sanity: predicted goal total should track the actual.
            "calibration_pred_goal_sum": round(gm.pred_goal_sum, 1),
            "calibration_actual_goal_sum": gm.actual_goal_sum,
        },
        "matches": tbl[
            [
                "match_no",
                "date",
                "opponent",
                "venue",
                "gf",
                "ga",
                "result",
                "points",
                "xgf",
                "xga",
                "lambda_for",
                "lambda_against",
                "p_win",
                "p_draw",
                "p_loss",
                "xpts",
            ]
        ].to_dict(orient="records"),
    }
