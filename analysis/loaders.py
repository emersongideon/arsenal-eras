"""Load raw StatsBomb / Understat data into a single canonical schema.

Canonical per-match DataFrame columns (one row per Arsenal league match):
    season, match_no, date, opponent, venue ('H'/'A'),
    gf, ga (actual goals), result ('W'/'D'/'L'), points,
    xgf, xga (expected goals for / against)

Canonical per-player DataFrame columns:
    season, player, position, apps, minutes, shots, goals, xg,
    assists, xa, npg, npxg
"""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

import pandas as pd

from . import config as C

# StatsBomb open-data is served as raw JSON from GitHub. We cache each file under
# data/raw and download on demand, so the pipeline reproduces from a clean clone
# (the ~106 MB of events is git-ignored) without any manual fetch step.
_SB_BASE = "https://raw.githubusercontent.com/statsbomb/open-data/master/data"


def _sb_json(rel_url: str, cache: Path) -> object:
    if cache.exists() and cache.stat().st_size > 0:
        return json.loads(cache.read_text())
    cache.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(
        f"{_SB_BASE}/{rel_url}", headers={"User-Agent": "arsenal-eras/1.0"}
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read()
    cache.write_bytes(raw)
    return json.loads(raw)

# Understat uses short club names for a handful of teams; map them to the same
# canonical names used in facts.FINAL_TABLE so joins/filters line up.
UNDERSTAT_NAME_FIX = {
    "Brighton": "Brighton & Hove Albion",
    "Leeds": "Leeds United",
    "Tottenham": "Tottenham Hotspur",
    "West Ham": "West Ham United",
}


def _result(gf: int, ga: int) -> str:
    return "W" if gf > ga else ("D" if gf == ga else "L")


# ---------------------------------------------------------------------------
# 2003/04 - StatsBomb open data
# ---------------------------------------------------------------------------
def load_statsbomb_matches(raw: Path = C.RAW) -> pd.DataFrame:
    """Build the 2003/04 per-match frame from cached StatsBomb JSON.

    xGF / xGA are summed from every shot event's `statsbomb_xg`, split by team.
    """
    comp, season = C.SB_COMPETITION_ID, C.SB_SEASON_ID
    matches = _sb_json(
        f"matches/{comp}/{season}.json", raw / f"matches_{comp}_{season}.json"
    )
    matches.sort(key=lambda m: m["match_date"])

    rows = []
    for i, m in enumerate(matches, start=1):
        mid = m["match_id"]
        home = m["home_team"]["home_team_name"]
        away = m["away_team"]["away_team_name"]
        is_home = home == C.TEAM
        opponent = away if is_home else home
        venue = "H" if is_home else "A"
        gf = m["home_score"] if is_home else m["away_score"]
        ga = m["away_score"] if is_home else m["home_score"]

        events = _sb_json(f"events/{mid}.json", raw / f"events_{mid}.json")
        xgf = xga = 0.0
        for e in events:
            if e["type"]["name"] != "Shot":
                continue
            xg = e["shot"].get("statsbomb_xg", 0.0) or 0.0
            if e["team"]["name"] == C.TEAM:
                xgf += xg
            else:
                xga += xg

        rows.append({
            "season": C.S0304,
            "match_no": i,
            "date": m["match_date"],
            "opponent": opponent,
            "venue": venue,
            "gf": int(gf),
            "ga": int(ga),
            "result": _result(gf, ga),
            "points": C.POINTS[_result(gf, ga)],
            "xgf": round(xgf, 4),
            "xga": round(xga, 4),
        })
    return pd.DataFrame(rows)


def load_statsbomb_players(raw: Path = C.RAW) -> pd.DataFrame:
    """Per-player 2003/04 shooting aggregates from StatsBomb events + lineups."""
    comp, season = C.SB_COMPETITION_ID, C.SB_SEASON_ID
    matches = _sb_json(
        f"matches/{comp}/{season}.json", raw / f"matches_{comp}_{season}.json"
    )
    agg: dict[str, dict] = {}

    def rec(name: str) -> dict:
        return agg.setdefault(name, {
            "player": name, "position_minutes": {},
            "minutes": 0.0, "shots": 0, "goals": 0, "xg": 0.0, "apps": 0,
        })

    for m in matches:
        mid = m["match_id"]
        lineups = _sb_json(f"lineups/{mid}.json", raw / f"lineup_{mid}.json")
        arsenal = next(t for t in lineups if t["team_name"] == C.TEAM)

        played_this_match: set[str] = set()
        for p in arsenal["lineup"]:
            mins = _minutes_from_positions(p["positions"])
            if mins <= 0:
                continue
            r = rec(p["player_name"])
            r["minutes"] += mins
            r["apps"] += 1
            played_this_match.add(p["player_name"])
            if p["positions"]:
                pos = p["positions"][0]["position"]
                r["position_minutes"][pos] = r["position_minutes"].get(pos, 0) + mins

        events = _sb_json(f"events/{mid}.json", raw / f"events_{mid}.json")
        for e in events:
            if e["type"]["name"] != "Shot" or e["team"]["name"] != C.TEAM:
                continue
            r = rec(e["player"]["name"])
            r["shots"] += 1
            r["xg"] += e["shot"].get("statsbomb_xg", 0.0) or 0.0
            if e["shot"]["outcome"]["name"] == "Goal":
                r["goals"] += 1

    rows = []
    for r in agg.values():
        pos = (max(r["position_minutes"].items(), key=lambda kv: kv[1])[0]
               if r["position_minutes"] else "Unknown")
        rows.append({
            "season": C.S0304, "player": r["player"], "position": pos,
            "apps": r["apps"], "minutes": round(r["minutes"], 1),
            "shots": r["shots"], "goals": r["goals"], "xg": round(r["xg"], 3),
            # StatsBomb aggregation here is shooting-only; assist/npx fields are
            # NaN (not available) so dtypes stay numeric when concatenated with
            # the Understat frame.
            "assists": float("nan"), "xa": float("nan"),
            "npg": float("nan"), "npxg": float("nan"),
        })
    return pd.DataFrame(rows)


def _minutes_from_positions(positions: list) -> float:
    """Minutes on the pitch from lineup position stints (90-min regulation base)."""
    def to_min(mmss: str) -> float:
        mm, ss = mmss.split(":")
        return int(mm) + int(ss) / 60.0

    total = 0.0
    for pos in positions:
        start = (pos["from_period"] - 1) * 45.0 + to_min(pos["from"])
        if pos["to"] is not None:
            tp = pos["to_period"] if pos["to_period"] is not None else pos["from_period"]
            end = (tp - 1) * 45.0 + to_min(pos["to"])
        else:
            end = C.PER90_BASE
        total += max(0.0, end - start)
    return round(min(total, C.PER90_BASE), 1)


# ---------------------------------------------------------------------------
# 2025/26 - Understat
# ---------------------------------------------------------------------------
def _fix_name(title: str) -> str:
    return UNDERSTAT_NAME_FIX.get(title, title)


def load_understat_matches(path: Path = C.UNDERSTAT_FILE) -> pd.DataFrame:
    """2025/26 per-match frame from Understat `datesData`."""
    data = json.loads(path.read_text())
    played = [d for d in data["dates"] if d.get("isResult")]
    played.sort(key=lambda d: d["datetime"])

    rows = []
    for i, d in enumerate(played, start=1):
        is_home = d["h"]["title"] == C.TEAM
        opponent = _fix_name(d["a"]["title"] if is_home else d["h"]["title"])
        venue = "H" if is_home else "A"
        gf = int(d["goals"]["h"]) if is_home else int(d["goals"]["a"])
        ga = int(d["goals"]["a"]) if is_home else int(d["goals"]["h"])
        xgf = float(d["xG"]["h"]) if is_home else float(d["xG"]["a"])
        xga = float(d["xG"]["a"]) if is_home else float(d["xG"]["h"])
        rows.append({
            "season": C.S2526,
            "match_no": i,
            "date": d["datetime"][:10],
            "opponent": opponent,
            "venue": venue,
            "gf": gf, "ga": ga,
            "result": _result(gf, ga),
            "points": C.POINTS[_result(gf, ga)],
            "xgf": round(xgf, 4),
            "xga": round(xga, 4),
        })
    return pd.DataFrame(rows)


def load_understat_players(path: Path = C.UNDERSTAT_FILE) -> pd.DataFrame:
    """Per-player 2025/26 aggregates from Understat `playersData`.

    Note: Understat's playersData exposes raw `shots` directly, so no Sh90-based
    derivation is needed (contrary to what the team-page HTML table suggested).
    """
    data = json.loads(path.read_text())
    rows = []
    for p in data["players"]:
        rows.append({
            "season": C.S2526,
            "player": p["player_name"],
            "position": p.get("position", "Unknown"),
            "apps": int(p["games"]),
            "minutes": float(p["time"]),
            "shots": int(p["shots"]),
            "goals": int(p["goals"]),
            "xg": round(float(p["xG"]), 3),
            "assists": int(p["assists"]),
            "xa": round(float(p["xA"]), 3),
            "npg": int(p["npg"]),
            "npxg": round(float(p["npxG"]), 3),
        })
    return pd.DataFrame(rows)
