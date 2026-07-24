"""Orchestrate the full pipeline and write data/processed/*.json.

Run:  python -m analysis.build
Outputs (all consumed by the API / frontend):
  seasons.json           headline summaries + the three fact/measured/spec tags
  matches.json           per-match rows (both seasons) incl. rolling form + xpts
  players.json           per-player shooting aggregates (both seasons)
  model.json             expected-points model output + calibration diagnostics
  era.json               Act 3 levers (VAR / fixture load / schedule difficulty)
  thought_experiment.json Act 4 speculative range + slider spec
  meta.json              provenance for the whole build
"""

from __future__ import annotations

import json

import pandas as pd

from . import config as C
from . import era, loaders, model, transforms


def _round_records(df: pd.DataFrame) -> list[dict]:
    return json.loads(df.to_json(orient="records"))


def run() -> dict:
    # --- load canonical frames --------------------------------------------
    m0304 = loaders.load_statsbomb_matches()
    m2526 = loaders.load_understat_matches()
    matches = pd.concat([m0304, m2526], ignore_index=True)

    p0304 = loaders.load_statsbomb_players()
    p2526 = loaders.load_understat_players()
    players = pd.concat([p0304, p2526], ignore_index=True)

    # --- transforms --------------------------------------------------------
    summaries = transforms.all_season_summaries(matches)
    matches_roll = transforms.add_rolling_form(matches)
    players_tbl = transforms.player_table(players)

    # --- model (Act 2) -----------------------------------------------------
    model_by_season = {
        C.S0304: model.season_model_result(m0304),
        C.S2526: model.season_model_result(m2526),
    }

    # --- era levers (Act 3) ------------------------------------------------
    era_payload = {
        "var": era.var_lever(),
        "fixture_load": era.fixture_load_lever(),
        "schedule_difficulty": era.schedule_difficulty_lever({C.S0304: m0304, C.S2526: m2526}),
    }

    # --- thought experiment (Act 4) ---------------------------------------
    invincibles_points = int(m0304["points"].sum())
    te_payload = era.thought_experiment_spec(invincibles_points)

    # --- write -------------------------------------------------------------
    C.PROCESSED.mkdir(parents=True, exist_ok=True)
    outputs = {
        "seasons.json": _round_records(summaries),
        "matches.json": _round_records(matches_roll),
        "players.json": _round_records(players_tbl),
        "model.json": model_by_season,
        "era.json": era_payload,
        "thought_experiment.json": te_payload,
        "meta.json": {
            "title": "Arsenal Eras - 2003/04 vs 2025/26",
            "question": "Two Arsenal title teams, 22 years apart. Which one had the harder job?",
            "seasons": [C.S0304, C.S2526],
            "sources": {
                "2003/04": "StatsBomb Open Data (github.com/statsbomb/open-data), "
                "Premier League competition_id=2, season_id=44.",
                "2025/26": "Understat (understat.com) per-match xG + player data.",
            },
            "model": "PoissonRegressor(goals ~ xG) -> independent-Poisson match "
            "outcomes -> expected points.",
            "honesty_note": "Every figure is tagged fact / measured / speculative "
            "and never blended.",
        },
    }
    # Canonical location, plus a baked copy in the web app's public dir so the
    # frontend runs fully offline (no request at load time).
    web_data = C.ROOT / "web" / "public" / "data"
    for target in (C.PROCESSED, web_data):
        target.mkdir(parents=True, exist_ok=True)
        for name, payload in outputs.items():
            (target / name).write_text(json.dumps(payload, indent=2))

    return {
        "matches": len(matches),
        "players": len(players_tbl),
        "model": {
            s: (r["actual_points"], r["expected_points"]) for s, r in model_by_season.items()
        },
        "written": list(outputs),
    }


if __name__ == "__main__":
    result = run()
    print("Build complete.")
    print(f"  matches: {result['matches']}, players: {result['players']}")
    for season, (act, exp) in result["model"].items():
        print(f"  {season}: actual {act} pts, expected {exp} pts")
    print(f"  wrote: {', '.join(result['written'])} -> data/processed/")
