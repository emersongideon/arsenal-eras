"""Arsenal Eras - REST API (FastAPI).

Serves the processed season data and model output from an in-memory SQLite DB,
and recomputes the Act-4 thought-experiment range live (reusing the analysis
package, the single source of truth for that arithmetic).

Run:  uvicorn main:app --app-dir backend --port 8000
"""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import db
from models import (
    HealthResponse,
    Match,
    Player,
    SeasonSummary,
    ThoughtExperimentResult,
)

# Make the repo-root `analysis` package importable so the API can reuse the
# exact thought-experiment function the pipeline used.
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from analysis import era as era_mod  # noqa: E402

app = FastAPI(
    title="Arsenal Eras API",
    version="1.0.0",
    description="2003/04 vs 2025/26 - expected-points model, era levers, and a "
    "clearly-labelled speculative thought experiment.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

CONN = db.build_connection()


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    seasons = [r["season"] for r in db.all_rows(CONN, "SELECT season FROM seasons")]
    n = db.all_rows(CONN, "SELECT COUNT(*) AS n FROM matches")[0]["n"]
    return HealthResponse(status="ok", seasons=seasons, matches=n)


@app.get("/api/meta")
def meta() -> dict:
    return db.one_document(CONN, "meta")


@app.get("/api/seasons", response_model=list[SeasonSummary])
def seasons() -> list[dict]:
    # Preserve chronological order (2003/04 before 2025/26).
    return db.all_rows(CONN, "SELECT * FROM seasons ORDER BY season")


@app.get("/api/matches", response_model=list[Match])
def matches(season: str | None = Query(None, description="e.g. '2003/04'")) -> list[dict]:
    if season:
        return db.all_rows(
            CONN, "SELECT * FROM matches WHERE season = ? ORDER BY match_no", (season,)
        )
    return db.all_rows(CONN, "SELECT * FROM matches ORDER BY season, match_no")


@app.get("/api/players", response_model=list[Player])
def players(
    season: str | None = Query(None),
    min_shots: int = Query(0, ge=0),
    sort_by: str = Query("xg", pattern="^(xg|goals|shots|minutes|goals_minus_xg|xg_per_90)$"),
) -> list[dict]:
    sql = "SELECT * FROM players WHERE shots >= ?"
    params: list = [min_shots]
    if season:
        sql += " AND season = ?"
        params.append(season)
    sql += f" ORDER BY {sort_by} DESC"  # sort_by is regex-validated above
    return db.all_rows(CONN, sql, tuple(params))


@app.get("/api/model")
def model(season: str | None = Query(None)) -> dict:
    doc = db.one_document(CONN, "model")
    if season:
        if season not in doc:
            raise HTTPException(404, f"no model output for season {season!r}")
        return doc[season]
    return doc


@app.get("/api/era")
def era() -> dict:
    return db.one_document(CONN, "era")


@app.get("/api/thought-experiment", response_model=ThoughtExperimentResult)
def thought_experiment(
    var_points: float = Query(
        era_mod.VAR_SLIDER["default"],
        ge=era_mod.VAR_SLIDER["min"],
        le=era_mod.VAR_SLIDER["max"],
        description="VAR points assumption (the interactive lever).",
    ),
) -> dict:
    spec = db.one_document(CONN, "thought_experiment")
    return era_mod.thought_experiment(spec["base_points"], var_points)


@app.get("/api/thought-experiment/spec")
def thought_experiment_spec() -> dict:
    """The full Act-4 payload: components, assumptions, slider bounds."""
    return db.one_document(CONN, "thought_experiment")


# --- serve the built SPA at "/" for a single-service deploy -----------------
_dist = ROOT / "web" / "dist"
if _dist.exists():
    app.mount("/", StaticFiles(directory=str(_dist), html=True), name="spa")
