"""Orchestrate the full pipeline and write data/processed/*.json.

Run:  python -m analysis.build
Outputs (all consumed by the API / frontend):
  seasons.json        headline summaries per season (Section A)
  matches.json        per-match rows (both seasons) incl. rolling form
  players.json        per-player shooting aggregates (both seasons)
  model.json          expected-points model output + calibration (Act 2 / Section A)
  circumstances.json  Section B: chasing pack, margin, league shape, squad stability
  physical.json       Section C: squad age + fixture congestion
  congestion.json     Section D: league PPG split by rest bucket (performance under load)
  synthesis.json      model output re-read against the circumstances (Dashboard + verdict)
  meta.json           thesis, provenance, and the honesty framing
"""

from __future__ import annotations

import json

import pandas as pd

from . import circumstances, congestion, loaders, model, physical, synthesis, transforms
from . import config as C


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

    # --- transforms (Section A) -------------------------------------------
    summaries = transforms.all_season_summaries(matches)
    matches_roll = transforms.add_rolling_form(matches)
    players_tbl = transforms.player_table(players)

    # --- expected-points model (Act 2, re-used in Section D) --------------
    model_by_season = {
        C.S0304: model.season_model_result(m0304),
        C.S2526: model.season_model_result(m2526),
    }

    # --- circumstances (B), physical (C), congestion (D), synthesis -------
    circ_payload = circumstances.build()
    phys_payload = physical.build(players_tbl)
    cong_payload = congestion.build(matches)
    synth_payload = synthesis.build(model_by_season, circ_payload)

    outputs = {
        "seasons.json": _round_records(summaries),
        "matches.json": _round_records(matches_roll),
        "players.json": _round_records(players_tbl),
        "model.json": model_by_season,
        "circumstances.json": circ_payload,
        "physical.json": phys_payload,
        "congestion.json": cong_payload,
        "synthesis.json": synth_payload,
        "meta.json": {
            "title": "A framework to measure how hard a title was to win",
            "question": "A framework to measure how hard a title was to win",
            "subline": "This is a worked example of turning shot-level and match data "
            "into a repeatable read on title-campaign difficulty. Built from StatsBomb "
            "and Understat event data through a Poisson expected-points model, with every "
            "figure tagged as fact, model output, or interpretation.",
            "seasons": [C.S0304, C.S2526],
            "sources": {
                "2003/04": "StatsBomb Open Data (Arsenal shot/xG events); tables, squads "
                "and fixtures from public records.",
                "2025/26": "Understat (per-match xG + player data); tables, squads and "
                "fixtures from public records.",
            },
            "model": "PoissonRegressor(goals ~ xG) → independent-Poisson match "
            "outcomes → expected points.",
            "honesty_note": "Every figure is tagged fact / model output / interpretation, "
            "and never blended. Metrics without data for both eras are omitted or "
            "flagged, never fabricated.",
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
