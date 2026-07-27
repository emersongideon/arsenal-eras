"""Orchestrate the full pipeline and write data/processed/*.json.

Run:  python -m analysis.build
Outputs (all consumed by the API / frontend):
  seasons.json        headline summaries per season (Section A)
  matches.json        per-match rows (both seasons) incl. rolling form
  players.json        per-player shooting aggregates (both seasons)
  model.json          expected-points model output + calibration (Act 2 / Section A)
  circumstances.json  Section B: chasing pack, margin, league shape, squad continuity
  physical.json       Section C: squad age + fixture congestion
  synthesis.json      Section D: model output re-read against the circumstances
  meta.json           thesis, provenance, and the honesty framing
"""

from __future__ import annotations

import json

import pandas as pd

from . import circumstances, loaders, model, physical, synthesis, transforms
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

    # --- circumstances (B), physical (C), synthesis (D) -------------------
    circ_payload = circumstances.build()
    phys_payload = physical.build(players_tbl)
    synth_payload = synthesis.build(model_by_season, circ_payload)

    outputs = {
        "seasons.json": _round_records(summaries),
        "matches.json": _round_records(matches_roll),
        "players.json": _round_records(players_tbl),
        "model.json": model_by_season,
        "circumstances.json": circ_payload,
        "physical.json": phys_payload,
        "synthesis.json": synth_payload,
        "meta.json": {
            "title": "Two Arsenals - which era faced the harder task?",
            "question": "Two Arsenal title teams, 22 years apart. Which era faced the "
            "harder task - and how well did each side meet it?",
            "starting_fact": "On the raw table the 2003/04 Invincibles were the more "
            "dominant league campaign: 90 points, unbeaten. This story is about the "
            "difficulty of the task each side faced, not which squad was more talented.",
            "seasons": [C.S0304, C.S2526],
            "sources": {
                "2003/04": "StatsBomb Open Data (Arsenal shot/xG events); final tables, "
                "squads and fixtures from Wikipedia.",
                "2025/26": "Understat (per-match xG + player data); final tables, squads "
                "and fixtures from Wikipedia.",
            },
            "model": "PoissonRegressor(goals ~ xG) -> independent-Poisson match "
            "outcomes -> expected points.",
            "honesty_note": "Every figure is tagged fact / measured / interpretation "
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
